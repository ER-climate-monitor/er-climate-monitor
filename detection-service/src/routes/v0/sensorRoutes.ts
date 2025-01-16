import express from 'express';
import {
    getDetectionsFromSensor,
    saveDetection,
} from '../../controllers/v0/sensorController';
import { API_ROUTES } from './paths/detection.paths';

const router = express.Router();

router.route(API_ROUTES.SENSOR.DETECTIONS).post(saveDetection);
router.route(API_ROUTES.SENSOR.DETECTIONS).get(getDetectionsFromSensor);
router.route(API_ROUTES.SENSOR.POSITIONS).get(getDetectionsFromSensor);

export default router;
