import express, { Application } from 'express';
import dotenv from 'dotenv';
import { sensorRouter } from './routes/v0/sensorRoutes';
import mongoose from 'mongoose';
import { BASE_SENSOR_PATH_V0 } from './routes/v0/paths/sensorPaths';
import cors from 'cors';

dotenv.config();



function createServer(url: string): Application {
    const app: Application = express();
    mongoose.connect(url, { dbName: 'sensor-database' });
    app.use(express.json());
    app.use(BASE_SENSOR_PATH_V0, sensorRouter);
    return app;
}

async function dropTestDatabase() {
    const url: string =  String(process.env.TEST_DB_URL) || 'mongodb://localhost:27017/';
    mongoose.connect(url, { dbName: 'sensor-database' })
        .then((mongodb) => {
            mongodb.connection.dropDatabase();
        });
}



export { createServer, dropTestDatabase }
