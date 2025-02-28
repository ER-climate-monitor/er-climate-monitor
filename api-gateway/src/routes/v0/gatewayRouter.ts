import express from 'express';
import { authenticationRouter } from './authentication/authenticationRouter';
import { sensorRouter } from './sensor/sensorRouter';
import { notificationRouter } from './notification/notificationRouter';
import { detectionRouter } from './detection/detectionRouter';
/**
 * General gateway router for handling all the incoming requests.
 */
const gatewayRouter = express.Router();

gatewayRouter.use(authenticationRouter);
gatewayRouter.use(sensorRouter);
gatewayRouter.use(notificationRouter);
gatewayRouter.use(detectionRouter);

export { gatewayRouter };
