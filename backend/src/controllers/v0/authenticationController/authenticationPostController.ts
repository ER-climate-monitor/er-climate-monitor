import { Request, Response } from 'express';
import { BreakerFactory } from '../utils/circuitBreaker/circuitRequest';
import { AUTHENTICATION_ENDPOINT } from '../../../models/v0/serviceModels';
import { GET, POST } from '../utils/api/httpMethods';
import { removeServiceFromUrl } from '../utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../../routes/v0/paths/gatewayPaths';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { authenticationRedisClient } from '../utils/redis/redisClient';
import { fromAxiosToResponse } from '../utils/api/responseUtils';
import {
    AUTHENTICATE_ACTION,
    LOGIN_ACTION,
    REGISTER_ACTION,
    USER_ACTION_BODY,
    USER_JWT_TOKEN_BODY,
    USER_JWT_TOKEN_EXPIRATION_BODY,
} from '../../../models/v0/authentication/headers/authenticationHeaders';
import Logger from 'js-logger';
import { AuthenticationService } from '../../../service/authentication/authenticationService';

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
                Logger.info('Checking the validation of the input token');
                const expiration = await authenticationRedisClient.searchToken(request.body[USER_JWT_TOKEN_BODY]);
                if (expiration !== null) {
                    Logger.info('Token found, checking for the expiration');
                    response = isExpired(Number(expiration), response);
                } else {
                    Logger.info('Token not found, checking using the authentication service.');
                    const axiosResponse = await authenticationService.authenticateTokenOperation(
                        endpointPath,
                        request.headers,
                        request.body,
                    );
                    const expiration = axiosResponse.data[USER_JWT_TOKEN_EXPIRATION_BODY];
                    Logger.info('Caching the Token');
                    saveToken(axiosResponse);
                    response = isExpired(Number(expiration), response);
                }
            } catch (error) {
                Logger.error('Error during Token validation');
                if (error instanceof AxiosError) {
                    response = handleError(error, response);
                }
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

export { authentiationPostHandler };
