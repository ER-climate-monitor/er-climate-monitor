import mongoose from 'mongoose';
import createServer from './server';
import dotenv from 'dotenv';
import { detectionPublisher } from './controllers/v0/utils/brokerClient';
import Logger from 'js-logger';

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';

async function startServer() {
    try {
        dotenv.config();
        await mongoose.connect(DB_URL, { dbName: 'detections-database', autoIndex: false });
        console.log('Connected to MongoDB');

        detectionPublisher.connect();
        console.log('Connected to Notification Event Broker!');

        Logger.useDefaults();
        const app = createServer();
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

startServer();
