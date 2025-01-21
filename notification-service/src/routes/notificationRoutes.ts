import express from 'express';
import { DetectionBroker, DetectionEvent, parseSubscription } from '../DetectionBroker';
import { SocketManager } from '../socketManager';
import { HttpStatusCode } from 'axios';
const router = express.Router();

let messageBroker: DetectionBroker<DetectionEvent> | undefined;
let socketManager: SocketManager | undefined;

router.route('/sub').post((req, res) => {
    const { userId, subTopic } = req.body;
    subUser(userId, subTopic)
        ?.then((subInfo) => {
            if (subInfo) res.status(HttpStatusCode.Ok).json(subInfo);
            else throw new Error('Something went wrong during subscription');
        })
        .catch((err) => res.status(HttpStatusCode.BadRequest).json({ error: `something went wrong: ${err}` }));
});

async function subUser(
    userId: string,
    subTopic: string
): Promise<{ uid: string; topicAddr: string } | null | undefined> {
    return messageBroker?.subscribeUser(userId, parseSubscription(subTopic))?.then((success) => {
        if (success) return socketManager?.registerUser(userId, parseSubscription(subTopic));
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
