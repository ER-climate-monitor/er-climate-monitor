import express from 'express';
import {
    subscribeUser,
    deleteUserSubscription,
    getUserSubscriptions,
    getNotificationsForUser,
} from './handlers/notificationHttpHandler';
const router = express.Router();

router.route('/subscriptions').post(subscribeUser).delete(deleteUserSubscription).get(getUserSubscriptions);
router.route('/').get(getNotificationsForUser);

export { router };
