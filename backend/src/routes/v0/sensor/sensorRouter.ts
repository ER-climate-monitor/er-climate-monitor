import express from 'express';
import { SENSOR_REGISTRY_PATHS } from '../paths/gatewayPaths';
import { sensorPostHandler } from '../../../controllers/v0/domain/sensor/sensorPostController';
import { sensorGetHandler } from '../../../controllers/v0/domain/sensor/sensorGetController';

const sensorRouter = express.Router();

sensorRouter.route(SENSOR_REGISTRY_PATHS).post(sensorPostHandler).get(sensorGetHandler);

export { sensorRouter };
