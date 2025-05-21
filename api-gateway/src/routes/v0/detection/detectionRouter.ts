import express from 'express';
import { DETECTION_PATHS } from '../paths/gatewayPaths';
import { detectionGetHandler } from '../../../controllers/v0/domain/detection/detectionGetController';
import { detectionPostHandler } from '../../../controllers/v0/domain/detection/detectionPostController';

const detectionRouter = express.Router();

detectionRouter.route(DETECTION_PATHS).get(detectionGetHandler).post(detectionPostHandler);

export { detectionRouter };
