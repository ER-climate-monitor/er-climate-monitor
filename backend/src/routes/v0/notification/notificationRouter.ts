import express from 'express';
import { NOTIFICATIONS_API } from '../paths/gatewayPaths';
import { subscribeUser } from '../../../controllers/v0/domain/notifications/notificationController';

const notificationRouter = express.Router();

notificationRouter.route(NOTIFICATIONS_API.SERVICE.PATH + NOTIFICATIONS_API.PATHS.SUBSCRIPTION).post(subscribeUser);

export { notificationRouter };
