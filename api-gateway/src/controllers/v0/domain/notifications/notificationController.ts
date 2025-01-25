import { Request, response, Response } from 'express';
import Logger from 'js-logger';
import { NOTIFICATIONS_API } from '../../../../routes/v0/paths/gatewayPaths';
import HttpStatus from 'http-status-codes';
import { notificationService } from './notificationConfig';
import { USER_JWT_TOKEN_BODY } from '../../../../models/v0/authentication/headers/authenticationHeaders';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';

type Topic = {
    topic: string;
    sensorName?: string;
    query?: string;
};

type Subscription = {
    userId: string;
    topic: Topic;
};

const subscribeUser = async (req: Request, res: Response) => {
    const jwtToken = req.headers[USER_JWT_TOKEN_BODY.toLowerCase()] as string | undefined;
    if (!jwtToken) {
        res.status(HttpStatus.UNAUTHORIZED);
        return;
    }
    const userId = await notificationService.authenticationClient.searchToken(jwtToken).then((res) => res?.email);
    if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED);
        return;
    }

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
    } catch (err) {
        Logger.info(err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong: ' + err });
    }
};

export { subscribeUser, Subscription };
