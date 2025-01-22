import { Request, Response } from 'express';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../../../routes/v0/paths/gatewayPaths';
import HttpStatus from 'http-status-codes';
import {
    AUTHENTICATE_ACTION,
    LOGIN_ACTION,
    REGISTER_ACTION,
    USER_ACTION_BODY,
    USER_EMAIL_BODY,
    USER_JWT_TOKEN_BODY,
    USER_JWT_TOKEN_EXPIRATION_BODY,
    USER_ROLE_BODY,
} from '../../../../models/v0/authentication/headers/authenticationHeaders';
import Logger from 'js-logger';
import { authenticationService } from './authenticationConfig';
import { TokenValue } from '../../../../models/v0/tokenModel';
import { HttpResponse } from '../../utils/circuitBreaker/http/httpResponse';
import { fromHttpResponseToExpressResponse, handleError } from '../../utils/api/responseUtils';

Logger.useDefaults();

async function saveToken(response: HttpResponse) {
    response.data;
    const tokenValue = new TokenValue(
        String(response.data[USER_EMAIL_BODY]),
        String(response.data[USER_ROLE_BODY]),
        Number(response.data[USER_JWT_TOKEN_EXPIRATION_BODY]),
    );
    authenticationService.authenticationClient.setToken(String(response.data[USER_JWT_TOKEN_BODY]), tokenValue);
}

function isExpired(expiration: number, token: string, response: Response) {
    const now = new Date().getTime();
    if (now >= expiration && expiration !== null) {
        response.status(HttpStatus.UNAUTHORIZED);
        authenticationService.authenticationClient.deleteToken(token);
    } else {
        response.status(HttpStatus.ACCEPTED);
    }
    return response;
}

const authentiationPostHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, request.url);
    const action = request.body[USER_ACTION_BODY];
    switch (action) {
        case REGISTER_ACTION: {
            try {
                const httpResponse = await authenticationService.registerOperation(
                    endpointPath,
                    request.headers,
                    request.body,
                );
                response = fromHttpResponseToExpressResponse(httpResponse, response);
                if (response.statusCode === HttpStatus.CREATED) {
                    Logger.info('User registered correctly, saving the token and Its expiration.');
                    saveToken(httpResponse);
                }
                response.send(httpResponse.data);
            } catch (error) {
                Logger.error("Error during user's registration " + error);
                if (error instanceof Error) {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
                }
            } finally {
                response.end();
            }
            return;
        }
        case LOGIN_ACTION: {
            try {
                const httpResponse = await authenticationService.loginOperation(
                    endpointPath,
                    request.headers,
                    request.body,
                );
                response = fromHttpResponseToExpressResponse(httpResponse, response);
                if (response.statusCode === HttpStatus.OK) {
                    Logger.info('User correctly logged in. Saving the token.');
                    saveToken(httpResponse);
                }
                response.send(httpResponse.data);
            } catch (error) {
                Logger.error("Error during user's login " + error);
                if (error instanceof Error) {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
                }
            } finally {
                response.end();
            }
            return;
        }
        case AUTHENTICATE_ACTION: {
            try {
                Logger.info('Checking the validation of the input token');
                const token = await authenticationService.authenticationClient.searchToken(
                    request.body[USER_JWT_TOKEN_BODY],
                );
                if (token !== null && token.expiration !== null) {
                    Logger.info('Token found, checking for the expiration');
                    response = isExpired(token.expiration, request.body[USER_JWT_TOKEN_BODY], response);
                } else {
                    Logger.info('Token not found, checking using the authentication service.');
                    const httpResponse = await authenticationService.authenticateTokenOperation(
                        endpointPath,
                        request.headers,
                        request.body,
                    );
                    if (httpResponse.statusCode !== HttpStatus.ACCEPTED) {
                        response.status(HttpStatus.UNAUTHORIZED);
                        return;
                    }

                    const expiration = Number(httpResponse.data[USER_JWT_TOKEN_EXPIRATION_BODY]);
                    Logger.info('Caching the Token');
                    saveToken(httpResponse);
                    response = isExpired(expiration, request.body[USER_JWT_TOKEN_BODY], response);
                }
            } catch (error) {
                Logger.error('Error during Token validation');
                if (error instanceof Error) {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
                }
            } finally {
                response.end();
            }
            return;
        }
        default: {
            Logger.error("Error, the request's actions has not been found");
            response.status(HttpStatus.BAD_REQUEST).end();
        }
    }
};

export { authentiationPostHandler };
