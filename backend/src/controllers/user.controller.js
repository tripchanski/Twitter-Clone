import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { clerkClient, getAuth } from '@clerk/express';

export const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({user});
});


export const updateProfile = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const user = await User.findOneAndUpdate({  clerkId: userId }, req.body, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
});


export const syncUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    const existingUser = await User.findOne({ clerkId: userId });
    if (existingUser) {
        return res.status(200).json({ user: existingUser });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const userData = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        username: clerkUser.emailAddresses[0].emailAddress.split('@')[0],
        profilePicture: clerkUser.imageUrl || '',
    }

    const user = await User.create(userData);
    res.status(201).json({ user });
});


export const getCurrentUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
});


export const followUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { targetUserId } = req.params;

    if (userId === targetUserId) return res.status(400).json({ message: "You cannot follow yourself" });

    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
        await User.findByIdAndUpdate(currentUser._id, { $pull: { following: targetUser._id } });
        await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: currentUser._id } });
    } else {
        await User.findByIdAndUpdate(currentUser._id, { $push: { following: targetUser._id } });
        await User.findByIdAndUpdate(targetUser._id, { $push: { followers: currentUser._id } });

        await Notification.create({
            from: currentUser._id,
            to: targetUserId,
            type: 'follow',
        });
    }


    res.status(200).json({ message: isFollowing ? 'Unfollowed user' : 'Followed user' });
});