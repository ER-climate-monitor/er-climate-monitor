import express from 'express';
import { SENSOR_REGISTRY_PATHS } from '../paths/gatewayPaths';
import { sensorPostHandler } from '../../../controllers/v0/domain/sensor/sensorPostController';
import { sensorGetHandler } from '../../../controllers/v0/domain/sensor/sensorGetController';
import { sensorDeleteHandler } from '../../../controllers/v0/domain/sensor/sensorDeleteController';

const sensorRouter = express.Router();

sensorRouter.route(SENSOR_REGISTRY_PATHS).post(sensorPostHandler).get(sensorGetHandler).delete(sensorDeleteHandler);

export { sensorRouter };
