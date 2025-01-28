import {
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
            if (userSubs.subscriptions.some((s) => s.topic == sub.topic)) {
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

const deleteUserSubscription = async (userId: string, topic: string): Promise<boolean> => {
    try {
        const userSubs = await userSubscriptionModel.findOne({ userId });

        if (!userSubs) {
            throw new Error('User is subscribed to no topics!');
        }

        const updatedSubscriptions = userSubs?.subscriptions.filter((sub) => sub.topic !== topic);
        if (updatedSubscriptions?.length === userSubs?.subscriptions.length) {
            throw new Error('No subscriptins have been founded for the specified user and topic');
        }

        userSubs.subscriptions = updatedSubscriptions;
        await userSubs.save();
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

const retrieveDetectionEventsOfType = async (type: string): Promise<DetectionEventDocument[]> => {
    try {
        return await detectionEventModel.find({ type: type });
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
        (await retrieveDetectionEventsOfType(sub.topic)).forEach((e) => res.add(e));
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
};
