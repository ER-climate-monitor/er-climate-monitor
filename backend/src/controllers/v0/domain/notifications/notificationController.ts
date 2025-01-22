import { Request, Response } from 'express';
import Logger from 'js-logger';
import { NOTIFICATIONS_API } from '../../../../routes/v0/paths/gatewayPaths';
import HttpStatus from 'http-status-codes';
import { notificationService } from './notificationConfig';
import { USER_JWT_TOKEN_BODY } from '../../../../models/v0/authentication/headers/authenticationHeaders';

const getTopics = async (_: Request, res: Response) => {
    notificationService
        .getTopics(NOTIFICATIONS_API.PATHS.TOPICS)
        .then((response) => response.data)
        .then((topics) => res.status(HttpStatus.OK).json(topics))
        .catch((err: Error) => {
            Logger.error('An error occurred when getting topics: ', err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
        });
};

// TODO: see if it's better to make implement this function to the specific service itself.
const getTopicQueries = async (req: Request, res: Response) => {
    const topicId = req.params['topic'];
    if (!topicId) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'You must include in your request a topic id!' });
        return;
    }

    notificationService
        .getTopicQueries(NOTIFICATIONS_API.PATHS.TOPIC_QUERIES, topicId)
        .then((r) => r.data)
        .then((data) => res.status(HttpStatus.OK).json(data))
        .catch((err: Error) => {
            Logger.error('An error occurred when getting topic queries: ', err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
        });
};

const subcribeUser = async (req: Request, res: Response) => {
    const jwtToken = req.headers[USER_JWT_TOKEN_BODY.toLowerCase()] as string | undefined;
    if (!jwtToken) {
        res.status(HttpStatus.UNAUTHORIZED);
        return;
    }
    const userId = await notificationService.authenticationClient.searchToken(jwtToken).then((res) => res?.email);
    const topicId = req.params['topic'];
    const queryId = req.params['query'];

    if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED);
        return;
    } else if (!topicId || !queryId) {
        res.status(HttpStatus.BAD_REQUEST).json({
            error: `Given topic or query are not valid. Received topic: ${topicId}, query: ${queryId}`,
        });
    }

    notificationService
        .suscribeUser(NOTIFICATIONS_API.PATHS.SUBSCRIPTION, {
            userId: userId,
            topic: topicId,
            query: queryId,
        })
        .then((r) => {
            if (r.statusCode !== HttpStatus.OK) {
                throw new Error(`An error occurred (${r.statusCode}): ${r.data}`);
            }
            return r.data;
        })
        .then((data) => {
            res.status(HttpStatus.OK).json(data);
        })
        .catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong: ' + err });
        });
};

export { getTopics, getTopicQueries, subcribeUser };
