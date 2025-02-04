import express from 'express';
import { DETECTION_PATHS } from '../paths/gatewayPaths';
import { detectionGetHandler } from '../../../controllers/v0/domain/detection/detectionGetController';

const detectionRouter = express.Router();

detectionRouter
    .route(DETECTION_PATHS + "/*")
    .get(detectionGetHandler)

export { detectionRouter };
