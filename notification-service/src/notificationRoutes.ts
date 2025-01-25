import express from 'express';
import { subscribeUser, deleteUserSubscription, getUserSubscriptions } from './handlers/notificationHttpHandler';
const router = express.Router();

router.route('/subscription').post(subscribeUser).delete(deleteUserSubscription).get(getUserSubscriptions);

export { router };
