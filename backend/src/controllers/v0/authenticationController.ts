import { Request, Response } from 'express';
import { BreakerFactory } from './utils/circuitBreaker/circuitRequest';
import { AUTHENTICATION_ENDPOINT } from '../../models/v0/serviceModels';
import { GET, POST } from './utils/api/httpMethods';
import { removeServiceFromUrl } from './utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../routes/v0/paths/gatewayPaths';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { authenticationRedisClient } from './utils/redis/redisClient';
import { fromAxiosToResponse } from './utils/api/responseUtils';
import {
    AUTHENTICATE_ACTION,
    LOGIN_ACTION,
    REGISTER_ACTION,
    USER_ACTION_BODY,
    USER_JWT_TOKEN_BODY,
    USER_JWT_TOKEN_EXPIRATION_BODY,
} from '../../models/v0/authentication/headers/authenticationHeaders';
import Logger from 'js-logger';
import { AuthenticationService } from '../../service/authentication/authenticationService';

Logger.useDefaults();
const breaker = BreakerFactory.axiosBreakerWithDefaultOptions();
const authenticationService = new AuthenticationService(breaker, AUTHENTICATION_ENDPOINT);

async function saveToken(response: AxiosResponse) {
    authenticationRedisClient.setToken(
        String(response.data[USER_JWT_TOKEN_BODY]),
        String(response.data[USER_JWT_TOKEN_EXPIRATION_BODY]),
    );
}

function handleError(error: AxiosError<any, any>, response: Response) {
    if (error.response !== undefined) {
        response = fromAxiosToResponse(error.response, response);
        response.send(error.response.data);
    }
    return response;
}

function isExpired(expiration: Number, response: Response) {
    const now = new Date().getTime();
    if (now >= Number(expiration)) {
        response.status(HttpStatusCode.Unauthorized);
    } else {
        response.status(HttpStatusCode.Accepted);
    }
    return response;
}

const authenticationGetHandler = async (request: Request, response: Response) => {
    try {
        const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, request.url);
        breaker
            .fireRequest(AUTHENTICATION_ENDPOINT, GET, endpointPath, request.headers, request.body)
            .then((axiosResponse) => {
                Logger.info('Received a new GET requesto for the Authentication service.');
                fromAxiosToResponse(axiosResponse, response).send(axiosResponse.data).end();
            })
            .catch((error) => {});
    } catch (error) {
        response.status(HttpStatusCode.BadRequest);
    }
    response.end();
};

export { authenticationGetHandler };
