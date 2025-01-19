import express from 'express';
import { authenticationRouter } from './authentication/authenticationRouter';
import { sensorRouter } from './sensor/sensorRouter';

const gatewayRouter = express.Router();

gatewayRouter.use(authenticationRouter);
gatewayRouter.use(sensorRouter);

export { gatewayRouter };
