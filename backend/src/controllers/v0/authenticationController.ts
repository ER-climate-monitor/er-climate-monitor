import { Request, Response } from 'express';
import { BreakerFactory } from './utils/circuitBreaker/circuitRequest';
import { AUTHENTICATION_ENDPOINT } from '../../models/v0/serviceModels';
import { GET, POST } from './utils/api/httpMethods';
import { removeServiceFromUrl } from './utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../routes/v0/paths/gatewayPaths';
import { AxiosResponse, HttpStatusCode } from 'axios';
import { authenticationRedisClient } from './utils/redis/redisClient';
import { fromAxiosToResponse } from './utils/api/responseUtils';
import {
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

const authentiationPostHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, request.url);
    const action = request.body[USER_ACTION_BODY];
    switch(action) {
        case(REGISTER_ACTION): {
            authenticationService.registerOperation(endpointPath, request.headers, request.body)
                .then(async (axiosResponse: AxiosResponse<any, any>) => {
                    response = fromAxiosToResponse(axiosResponse, response);
                    if (response.statusCode === HttpStatusCode.Created) {
                        Logger.info('User registered correctly, saving the token and Its expiration.');
                        await authenticationRedisClient.setToken(
                            String(response.getHeader(USER_JWT_TOKEN_BODY)),
                            String(response.getHeader(USER_JWT_TOKEN_EXPIRATION_BODY)),);
                    }
                    response.send(axiosResponse.data).end();
                }).catch((error) => {
                    Logger.error(error);
                    response.status(HttpStatusCode.BadRequest);
                    response.end();
                });

        }case(LOGIN_ACTION): {

        }
    }
}

export { authenticationGetHandler, authentiationPostHandler };
