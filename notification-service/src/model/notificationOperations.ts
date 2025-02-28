import { stringifySubscription } from '../components/detectionBroker';
import {
    areSubscriptionTopicsEqual,
    DetectionEvent,
    DetectionEventDocument,
    detectionEventModel,
    SubscriptionTopic,
    UserSubscriptionDocument,
    userSubscriptionModel,
    UserSubscriptions,
} from './notificationModel';
import Logger from 'js-logger';

Logger.useDefaults();

const getAllSubscriptions = async (): Promise<UserSubscriptions[]> => {
    try {
        return await userSubscriptionModel.find({});
    } catch (error) {
        Logger.error('Error retrieving subscriptions', error);
        return [];
    }
};

const getUserSubscriptions = async (userId: string): Promise<UserSubscriptions | null> => {
    try {
        const res: UserSubscriptionDocument | null | undefined = await userSubscriptionModel.findOne({ userId });
        if (!res) {
            throw new Error('Provided user has no associated subscriptions');
        }
        return res.toJSON() as UserSubscriptions;
    } catch (error) {
        Logger.error(`Error retrieving subscriptions for user ${userId}: `, error);
        return null;
    }
};

const createUserSubscription = async (userId: string, sub: SubscriptionTopic): Promise<boolean> => {
    try {
        const userSubs = await userSubscriptionModel.findOne({ userId });
        if (userSubs) {
            if (
                (!sub.query && !sub.sensorName && userSubs.subscriptions.some((s) => s.topic == sub.topic)) ||
                (!sub.query &&
                    sub.sensorName &&
                    userSubs.subscriptions.some((s) => s.topic == sub.topic && s.sensorName == sub.sensorName)) ||
                (sub.query &&
                    !sub.sensorName &&
                    userSubs.subscriptions.some((s) => s.topic == sub.topic && s.query == sub.query)) ||
                (sub.query &&
                    sub.sensorName &&
                    userSubs.subscriptions.some(
                        (s) => s.topic == sub.topic && s.sensorName == sub.sensorName && s.query == sub.query
                    ))
            ) {
                throw new Error('User already subscribed for topic: ' + sub.topic);
            }
            userSubs.subscriptions.push(sub);
            await userSubs.save();
        } else {
            await new userSubscriptionModel({ userId, subscriptions: [sub] }).save();
        }
        return true;
    } catch (error) {
        Logger.error(`Error creating sub ${JSON.stringify(sub)} for user ${userId}: `, error);
        return false;
    }
};

const deleteUserSubscription = async (userId: string, topic: SubscriptionTopic): Promise<boolean> => {
    try {
        Logger.info(`Requested to delete ${stringifySubscription(topic)} for user ${userId}`);
        const res: UserSubscriptionDocument | null | undefined = await userSubscriptionModel.findOne({ userId });

        if (!res) {
            throw new Error('Provided user has no associated subscriptions');
        }
        const userSubs = res.toJSON() as UserSubscriptions;

        Logger.info(`Retrieved from db this subscription: ${JSON.stringify(userSubs)}`);

        const updatedSubscriptions = userSubs?.subscriptions.filter((sub) => !areSubscriptionTopicsEqual(sub, topic));

        Logger.info(`Updated subscriptions now are: ${JSON.stringify(updatedSubscriptions)}`);

        res.subscriptions = updatedSubscriptions;
        await res.save();
        return true;
    } catch (error) {
        Logger.error(`Error deleting user subscription for topic ${topic}: `, error);
        return false;
    }
};

const insertNewDetectionEvent = async (de: DetectionEvent): Promise<boolean> => {
    try {
        await new detectionEventModel(de).save();
        return true;
    } catch (err) {
        Logger.error(`An error occurred inserting event ${JSON.stringify(de)}: `, err);
        return false;
    }
};

const retrieveDetectionEventsOfType = async (
    type: string,
    query?: string,
    sensorName?: string
): Promise<DetectionEventDocument[]> => {
    try {
        if (!query && !sensorName) {
            return await detectionEventModel.find({ type: type });
        } else if (!query && sensorName) {
            return await detectionEventModel.find({ type: type, sensorName: sensorName });
        } else if (query && !sensorName) {
            return await detectionEventModel.find({ type: type, query: query });
        } else {
            return await detectionEventModel.find({ type: type, sensorName: sensorName, query: query });
        }
    } catch (err) {
        Logger.error(`Error retrieving detection events for topic ${type}: `, err);
        return [];
    }
};

const retrieveEventsForUser = async (userId: string): Promise<Set<DetectionEventDocument>> => {
    const subs = (await getUserSubscriptions(userId))?.subscriptions;
    if (!subs) return new Set();

    const res: Set<DetectionEventDocument> = new Set();
    for (const sub of subs) {
        (await retrieveDetectionEventsOfType(sub.topic, sub.query, sub.sensorName)).forEach((e) => res.add(e));
    }
    return res;
};

export {
    getUserSubscriptions,
    createUserSubscription,
    deleteUserSubscription,
    insertNewDetectionEvent,
    retrieveDetectionEventsOfType,
    retrieveEventsForUser,
    getAllSubscriptions,
};
