import express from 'express';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';


const app = express();

app.get('/', (req, res) => res.send('API is running...'));

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