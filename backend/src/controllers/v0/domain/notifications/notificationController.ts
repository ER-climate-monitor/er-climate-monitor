import { Request, Response } from 'express';
import axios, { HttpStatusCode } from 'axios';
import { Topic, TopicQuery } from '../../../../models/v0/notificationModels';
import Logger from 'js-logger';
import {
    NOTIFICATION_SERVICE_ENDPOINT,
    NOTIFICATION_TOPICS_PATH,
    NOTIFICATION_TOPIC_QUERIES_PATH,
    NOTIFICATION_SUBSCRIPTION_PATH,
} from '../../../../routes/v0/paths/gatewayPaths';
import { notificationService } from './notificationConfig';
import { USER_JWT_TOKEN_BODY } from '../../../../models/v0/authentication/headers/authenticationHeaders';

const getTopics = async (_: Request, res: Response) => {
    notificationService
        .getTopics(NOTIFICATION_TOPICS_PATH)
        .then((response) => response.data)
        .then((topics: Topic[]) => res.status(HttpStatusCode.Ok).json(topics))
        .catch((err: Error) => {
            Logger.error('An error occurred when getting topics: ', err);
            res.status(HttpStatusCode.InternalServerError);
        });
};

// TODO: see if it's better to make implement this function to the specific service itself.
const getTopicQueries = async (req: Request, res: Response) => {
    const topicId = req.params['topic'];
    if (!topicId) {
        res.status(HttpStatusCode.BadRequest).json({ error: 'You must include in your request a topic id!' });
        return;
    }

    notificationService
        .getTopicQueries(NOTIFICATION_TOPIC_QUERIES_PATH, topicId)
        .then((r) => r.data)
        .then((data: TopicQuery[]) => res.status(HttpStatusCode.Ok).json(data))
        .catch((err: Error) => {
            Logger.error('An error occurred when getting topic queries: ', err);
            res.status(HttpStatusCode.InternalServerError);
        });
};

const subcribeUser = async (req: Request, res: Response) => {
    const jwtToken = req.headers[USER_JWT_TOKEN_BODY.toLowerCase()];
    if (!jwtToken && jwtToken?.length != 1) {
        res.status(HttpStatusCode.Unauthorized);
        return;
    }
    const userId = await notificationService.authenticationClient.searchToken(jwtToken[0]).then((res) => res?.email);
    const topicId = req.params['topic'];
    const queryId = req.params['query'];

    if (!userId) {
        res.status(HttpStatusCode.Unauthorized);
        return;
    } else if (!topicId || !queryId) {
        res.status(HttpStatusCode.BadRequest).json({
            error: `Given topic or query are not valid. Received topic: ${topicId}, query: ${queryId}`,
        });
    }

    notificationService
        .suscribeUser(NOTIFICATION_SUBSCRIPTION_PATH, {
            userId: userId,
            topic: topicId,
            query: queryId,
        })
        .then((r) => {
            if (r.status !== HttpStatusCode.Ok) {
                throw new Error(`An error occurred (${r.status}): ${r.data}`);
            }
            return r.data;
        })
        .then((data: { uid: string; topicAddr: string }) => {
            res.status(HttpStatusCode.Ok).json(data);
        })
        .catch((err) => {
            res.status(HttpStatusCode.InternalServerError).json({ error: 'Something went wrong: ' + err });
        });
};

export { getTopics, getTopicQueries, subcribeUser };
