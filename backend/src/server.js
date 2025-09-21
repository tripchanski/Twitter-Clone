import express from 'express';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import cors from 'cors';
import {clerkMiddleware} from "@clerk/express";
import userRoutes from './routes/user.route.js';

const app = express();

app.use(cors())
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('API is running...'));

app.use("api/users", userRoutes);

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log(`Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();