import express from 'express';
// import { insertTopic } from '../controllers/notificationController';
import { MessageBroker } from '../messageBroker';
import { SocketManager } from '../socketManager';
import { HttpStatusCode } from 'axios';
import { Topic } from '../models/notificationModel';
const router = express.Router();

let messageBroker: MessageBroker<any> | undefined;
let socketManager: SocketManager | undefined;

router
    .route('/')
    .get((_, res) => {
        res.send(messageBroker?.getTopics() ?? []);
    })
    .put((req, res) => {
        const topic: Topic = req.body;
        messageBroker?.createTopic(topic)?.then((success) => {
            if (success)
                res.status(HttpStatusCode.Ok).json({ message: `Topic ${JSON.stringify(topic)} successfully created!` });
            else res.status(HttpStatusCode.InternalServerError).json({ error: 'maremma scalza' });
        });
    });

router.route('/sub').post((req, res) => {
    const { userId, topic, query } = req.body;
    subUser(userId, topic, query)
        ?.then((subInfo) => {
            if (subInfo) res.status(HttpStatusCode.Ok).json(subInfo);
            else throw new Error('Something went wrong during subscription');
        })
        .catch((err) => res.status(HttpStatusCode.BadRequest).json({ error: `something went wrong: ${err}` }));
});

async function subUser(
    userId: number,
    topic: string,
    query: string
): Promise<{ uid: string; topicAddr: string } | null | undefined> {
    return messageBroker?.subscribeUser(userId, { topicName: topic, queryName: query })?.then((success) => {
        if (success) return socketManager?.registerUser(userId, topic, query);
        else return null;
    });
}

function setMessageBroker(mb: MessageBroker<any>) {
    messageBroker = mb;
}

function setSocketManger(sm: SocketManager) {
    socketManager = sm;
}

export { router, setMessageBroker, setSocketManger };
