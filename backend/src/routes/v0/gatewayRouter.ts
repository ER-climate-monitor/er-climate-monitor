import express from 'express';
import { authenticationRouter } from './authentication/authenticationRouter';
import { sensorRouter } from './sensor/sensorRouter';
import { notificationRouter } from './notification/notificationRouter';

const gatewayRouter = express.Router();

gatewayRouter.use(authenticationRouter);
gatewayRouter.use(sensorRouter);
gatewayRouter.use(notificationRouter);

export { gatewayRouter };
