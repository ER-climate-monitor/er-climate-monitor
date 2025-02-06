import express from 'express';
import { authenticationRouter } from './authentication/authenticationRouter';
import { sensorRouter } from './sensor/sensorRouter';
import { notificationRouter } from './notification/notificationRouter';
import { detectionRouter } from './detection/detectionRouter';

const gatewayRouter = express.Router();

gatewayRouter.use(authenticationRouter);
gatewayRouter.use(sensorRouter);
gatewayRouter.use(notificationRouter);
gatewayRouter.use(detectionRouter);

export { gatewayRouter };
