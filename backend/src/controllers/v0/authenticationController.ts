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
    switch (action) {
        case REGISTER_ACTION: {
            try {
                const axiosResponse = await authenticationService.registerOperation(
                    endpointPath,
                    request.headers,
                    request.body,
                );
                response = fromAxiosToResponse(axiosResponse, response);
                if (response.statusCode === HttpStatusCode.Created) {
                    Logger.info('User registered correctly, saving the token and Its expiration.');
                    saveToken(axiosResponse);
                }
                response.send(axiosResponse.data);
            } catch (error) {
                Logger.error("Error during user's registration " + error);
                if (error instanceof AxiosError) {
                    response = handleError(error, response);
                }
            } finally {
                response.end();
            }
            return;
        }
        case LOGIN_ACTION: {
            try {
                const axiosResponse = await authenticationService.loginOperation(
                    endpointPath,
                    request.headers,
                    request.body,
                );
                response = fromAxiosToResponse(axiosResponse, response);
                if (response.statusCode === HttpStatusCode.Ok) {
                    Logger.info('User correctly logged in. Saving the token and Its expiration');
                    saveToken(axiosResponse);
                }
                response.send(axiosResponse.data);
            } catch (error) {
                Logger.error("Error during user's login " + error);
                if (error instanceof AxiosError) {
                    response = handleError(error, response);
                }
            } finally {
                response.end();
            }
            return;
        }
        case AUTHENTICATE_ACTION: {
            try {
                const expiration = await authenticationRedisClient.searchToken(request.body[USER_JWT_TOKEN_BODY]);
                if (expiration !== null) {
                } else {
                    const axiosResponse = await authenticationService.authenticateTokenOperation(
                        endpointPath,
                        request.headers,
                        request.body,
                    );

                    response = fromAxiosToResponse(axiosResponse, response);
                }
            } catch (error) {
            } finally {
                response.end();
            }
            return;
        }
        default: {
            Logger.error("Error, the request's actions has not been found");
            response.status(HttpStatusCode.BadRequest).end();
        }
    }
};

export { authenticationGetHandler, authentiationPostHandler };
