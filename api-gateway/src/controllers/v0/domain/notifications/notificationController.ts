import { Request, Response } from 'express';
import Logger from 'js-logger';
import { NOTIFICATIONS_API } from '../../../../routes/v0/paths/gatewayPaths';
import HttpStatus from 'http-status-codes';
import { notificationService } from './notificationConfig';
import { USER_TOKEN_HEADER } from '../../../../models/v0/authentication/headers/authenticationHeaders';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';
import { resolvePtr } from 'dns';
import { TokenValue } from '../../../../models/v0/tokenModel';

type Topic = {
    topic: string;
    sensorName?: string;
    query?: string;
};

type Subscription = {
    userId: string;
    topic: Topic;
};

const checkToken = async (request: Request, response: Response): Promise<string | null> => {
    const jwtToken = String(request.headers[USER_TOKEN_HEADER.toLowerCase()]);

    const isExpired = await notificationService.authenticationClient.isExpired(jwtToken);

    if (isExpired) {
        Logger.info('The token is expired');
        response.status(HttpStatus.UNAUTHORIZED).send();
        return null;
    }
    return jwtToken;
};

const extractUserIdFromToken = async (jwtToken: string, response: Response): Promise<string | null> => {
    const userId = await notificationService.authenticationClient.searchToken(jwtToken).then((res) => res?.email);
    if (!userId) {
        response.status(HttpStatus.UNAUTHORIZED).send();
        return null;
    }
    return userId;
};

const extractUserIdFromRequest = async (request: Request, response: Response): Promise<string | null> => {
    const jwtToken = await checkToken(request, response);

    if (!jwtToken) {
        response.send();
        return null;
    }

    const userId = await extractUserIdFromToken(jwtToken, response);
    if (!userId) {
        response.send();
        return null;
    }
    return userId;
};

const subscribeUser = async (req: Request, res: Response) => {
    const userId = await extractUserIdFromRequest(req, res);
    if (!userId) return;

    const topic: Topic = req.body;

    const sub: Subscription = {
        userId,
        topic,
    };

    Logger.info(`Serving subscriptio for user ${userId} to topic: `, topic);

    if (!topic || !sub) {
        res.status(HttpStatus.BAD_REQUEST).json({
            error: `Provied subscription (${JSON.stringify(sub)}) is not valid!`,
        });
    }

    try {
        const httpResponse = await notificationService.suscribeUser(
            NOTIFICATIONS_API.SERVICE.PATH + NOTIFICATIONS_API.PATHS.SUBSCRIPTION,
            sub,
        );

        res = fromHttpResponseToExpressResponse(httpResponse, res);
        res.send(httpResponse.data);
    } catch (error) {
        Logger.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'something went wrong: ' + (error as Error).message,
        });
    }
};

const getUserSubscriptions = async (request: Request, response: Response) => {
    try {
        const userId = await extractUserIdFromRequest(request, response);
        if (!userId) return;

        const httpResponse = await notificationService.getUserSubscriptions(
            NOTIFICATIONS_API.SERVICE.PATH + NOTIFICATIONS_API.PATHS.SUBSCRIPTION,
            userId,
        );
        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
    } catch (error) {
        Logger.error(error);
        response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: 'something went wrong: ' + (error as Error).message });
    }
};

const getAlertsForUser = async (request: Request, response: Response) => {
    try {
        const userId = await extractUserIdFromRequest(request, response);
        if (!userId) return;

        const httpResponse = await notificationService.getUserSubscriptions(NOTIFICATIONS_API.SERVICE.PATH, userId);
        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
    } catch (error) {
        Logger.error(error);
        response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: 'something went wrong: ' + (error as Error).message });
    }
};

const unsubscribeUser = async (request: Request, response: Response) => {
    try {
        const userId = await extractUserIdFromRequest(request, response);
        const topicAddr = request.query['topicAddr'] as string | undefined;

        if (!userId) return;
        if (!topicAddr) {
            response.status(HttpStatus.BAD_REQUEST).json({ error: `Invalid topic address provided ${topicAddr}` });
            return;
        }

        const httpResponse = await notificationService.unsubscribeUser(
            NOTIFICATIONS_API.SERVICE.PATH + NOTIFICATIONS_API.PATHS.SUBSCRIPTION,
            userId,
            topicAddr,
        );

        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
    } catch (error) {
        Logger.error(error);
        response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: 'something went wrong: ' + (error as Error).message });
    }
};

export { subscribeUser, getUserSubscriptions, getAlertsForUser, unsubscribeUser, Subscription };
