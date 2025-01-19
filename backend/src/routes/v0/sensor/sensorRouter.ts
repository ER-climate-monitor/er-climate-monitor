import express from 'express';
import { SENSOR_REGISTRY_PATHS } from '../paths/gatewayPaths';
import { sensorPostHandler } from '../../../controllers/v0/domain/sensor/sensorPostController';

const sensorRouter = express.Router();

sensorRouter.route(SENSOR_REGISTRY_PATHS).post(sensorPostHandler);

export { sensorRouter };
