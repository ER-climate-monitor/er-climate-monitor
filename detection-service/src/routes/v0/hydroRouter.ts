import express from 'express';
import { DETECTIONS_FROM_SENSOR_PATH, SAVE_DETECTION_PATH } from './paths/detection.paths';
import { saveDetection } from '../../controllers/v0/hydroController';
import { getDetectionsFromSensor } from '../../controllers/v0/temperatureController';

const hydroRouter = express.Router();

hydroRouter.route(SAVE_DETECTION_PATH).post(saveDetection);
hydroRouter.route(DETECTIONS_FROM_SENSOR_PATH).get(getDetectionsFromSensor);

export { hydroRouter };
