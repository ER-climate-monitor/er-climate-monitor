import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { DetectionBroker, parseSubscription } from '../components/detectionBroker';
import { SubscriptionTopic, DetectionEvent, detectionEventModel } from '../model/notificationModel';
import { SocketManager } from '../components/socketManager';
import {
    createUserSubscription,
    retrieveEventsForUser,
    getUserSubscriptions as getDbUserSubscriptions,
} from '../model/notificationOperations';

type Subscription = {
    userId: string;
    topic: SubscriptionTopic;
};

let messageBroker: DetectionBroker<DetectionEvent> | undefined;
let socketManager: SocketManager | undefined;

function setMessageBroker(mb: DetectionBroker<DetectionEvent>) {
    messageBroker = mb;
}

function setSocketManger(sm: SocketManager) {
    socketManager = sm;
}

const subscribeUser = async (request: Request, response: Response) => {
    subUser(request.body)
        ?.then((subInfo) => {
            if (subInfo) response.status(HttpStatusCode.Ok).json(subInfo);
            else throw new Error('Something went wrong during subscription');
        })
        .catch((err) => response.status(HttpStatusCode.BadRequest).json({ error: `something went wrong: ${err}` }));
};

async function subUser(sub: Subscription): Promise<{ uid: string; topicAddr: string } | null | undefined> {
    return messageBroker?.subscribeUser(sub.userId, sub.topic)?.then(async (success) => {
        if (!success) return null;

        const res = await createUserSubscription(sub.userId, sub.topic);

        return res ? socketManager?.registerUser(sub.userId, sub.topic) : null;
    });
}

const deleteUserSubscription = async (request: Request, response: Response) => {
    const userId = request.query['userId'] as string | undefined;
    const topicAddr = request.query['topicAddr'] as string | undefined;

    if (!userId || !topicAddr) {
        response
            .status(HttpStatusCode.BadRequest)
            .json({ error: `Invalid parameters, got: userId: ${userId}, topicAddr: ${topicAddr}` });
        return;
    }

    try {
        const sub = parseSubscription(topicAddr, socketManager!.topicPrefix);
        let success = await messageBroker?.unsubscribeUser(userId, sub);
        if (!success) {
            response.status(HttpStatusCode.NotFound).json({
                error: `something went wrong... are you really sure ${userId} was subscribed to ${topicAddr}?`,
            });
            return;
        }

        success = socketManager?.unregisterUser(userId, sub);
        if (!success) {
            response.status(HttpStatusCode.NotFound).json({
                error: `something went wrong during socket closing... are you really sure ${userId} was subscribed to ${topicAddr}?`,
            });
            return;
        }

        response.status(HttpStatusCode.Ok).send();
    } catch (err) {
        response.status(HttpStatusCode.InternalServerError).json({ error: (err as Error).message });
    }
};

const getUserSubscriptions = async (request: Request, response: Response) => {
    const userId: string | undefined = request.query['userId'] as string | undefined;
    if (!userId) {
        response.status(HttpStatusCode.BadRequest).json({ error: `Invalid provided userId (${userId})` });
        return;
    }

    try {
        const subs = messageBroker?.retrieveUserSubscriptions(userId!);
        response.status(HttpStatusCode.Ok).json(subs);
    } catch (err) {
        response.status(HttpStatusCode.InternalServerError).json({ error: (err as Error).message });
    }
};

const getNotificationsForUser = async (request: Request, response: Response) => {
    const userId: string | undefined = request.query['userId'] as string | undefined;

    if (!userId) {
        response.status(HttpStatusCode.BadRequest).json({ error: `Invalid provided userId (${userId})` });
        return;
    }

    try {
        const res = await retrieveEventsForUser(userId);
        response.status(HttpStatusCode.Ok).json(Array.from(res));
    } catch (err) {
        response.status(HttpStatusCode.InternalServerError).json({ error: (err as Error).message });
    }
};

const restoreUserConnections = async (request: Request, response: Response) => {
    const userId: string | undefined = request.query['userId'] as string | undefined;

    if (!userId) {
        response.status(HttpStatusCode.BadRequest).json({ error: `Invalid provided userId (${userId})` });
        return;
    }

    const subs: SubscriptionTopic[] | null | undefined = await getDbUserSubscriptions(userId).then(
        (res) => res?.subscriptions
    );

    if (!subs) {
        response.status(HttpStatusCode.NotFound).json({ error: `No subscriptions found for user: ${userId}` });
        return;
    }
    const subInfos: { uid: string; topicAddr: string }[] = subs.map((sub) => socketManager!.registerUser(userId, sub));
    response.status(HttpStatusCode.Ok).json(subInfos);
};

export {
    subscribeUser,
    deleteUserSubscription,
    getUserSubscriptions,
    setSocketManger,
    setMessageBroker,
    getNotificationsForUser,
    restoreUserConnections,
};
