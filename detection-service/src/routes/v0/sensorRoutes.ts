import express from 'express';
import {
    getDetectionsFromSensor,
    getSensorLocationsByType,
    saveDetection,
} from '../../controllers/v0/sensorController';
import { API_ROUTES } from './paths/detection.paths';
import cors from 'cors';

const router = express.Router();
router.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

router.route(API_ROUTES.SENSOR.DETECTIONS).post(saveDetection).get(getDetectionsFromSensor);
router.route(API_ROUTES.SENSOR.LOCATIONS).get(getSensorLocationsByType);

export default router;
