import express from 'express';
import { NOTIFICATIONS_API } from '../paths/gatewayPaths';
import {
    subscribeUser,
    unsubscribeUser,
    getUserSubscriptions,
    getAlertsForUser,
} from '../../../controllers/v0/domain/notifications/notificationController';

const notificationRouter = express.Router();

notificationRouter
    .route(NOTIFICATIONS_API.SERVICE.PATH + NOTIFICATIONS_API.PATHS.SUBSCRIPTION)
    .post(subscribeUser)
    .delete(unsubscribeUser)
    .get(getUserSubscriptions);
notificationRouter.route(NOTIFICATIONS_API.SERVICE.PATH).get(getAlertsForUser);

export { notificationRouter };
