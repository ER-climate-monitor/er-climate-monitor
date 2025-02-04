import express from 'express';
import {
    subscribeUser,
    deleteUserSubscription,
    getUserSubscriptions,
    getNotificationsForUser,
    restoreUserConnections,
} from './handlers/notificationHttpHandler';
const router = express.Router();

router.route('/subscriptions').post(subscribeUser).delete(deleteUserSubscription).get(getUserSubscriptions);
router.route('/subscriptions/restore').get(restoreUserConnections);
router.route('/').get(getNotificationsForUser);

export { router };
