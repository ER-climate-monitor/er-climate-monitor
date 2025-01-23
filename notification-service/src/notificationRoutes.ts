import express from 'express';
import { DetectionBroker, DetectionEvent, SubscriptionTopic } from './components/detectionBroker';
import { SocketManager } from './components/socketManager';
import { HttpStatusCode } from 'axios';
const router = express.Router();

let messageBroker: DetectionBroker<DetectionEvent> | undefined;
let socketManager: SocketManager | undefined;

type Subscription = {
    userId: string;
    topic: SubscriptionTopic;
};

router.route('/subscribe').post((req, res) => {
    subUser(req.body)
        ?.then((subInfo) => {
            if (subInfo) res.status(HttpStatusCode.Ok).json(subInfo);
            else throw new Error('Something went wrong during subscription');
        })
        .catch((err) => res.status(HttpStatusCode.BadRequest).json({ error: `something went wrong: ${err}` }));
});

async function subUser(sub: Subscription): Promise<{ uid: string; topicAddr: string } | null | undefined> {
    return messageBroker?.subscribeUser(sub.userId, sub.topic)?.then((success) => {
        if (success) return socketManager?.registerUser(sub.userId, sub.topic);
        else return null;
    });
}

function setMessageBroker(mb: DetectionBroker<DetectionEvent>) {
    messageBroker = mb;
}

function setSocketManger(sm: SocketManager) {
    socketManager = sm;
}

export { router, setMessageBroker, setSocketManger };
