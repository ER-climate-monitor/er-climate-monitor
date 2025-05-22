import express, { Application } from 'express';
import cors from 'cors';
import sensorRouter from './routes/v0/sensorRoutes';
import { API_ROUTES } from './routes/v0/paths/detection.paths';

export default function createServer(): Application {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(API_ROUTES.SENSOR.ROOT, sensorRouter);

    return app;
}
