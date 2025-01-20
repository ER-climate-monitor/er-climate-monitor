import { Request, Response } from 'express';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../../../routes/v0/paths/gatewayPaths';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { fromAxiosToResponse, handleAxiosError } from '../../utils/api/responseUtils';
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

Logger.useDefaults();

async function saveToken(response: AxiosResponse) {
    const tokenValue = new TokenValue(response.data[USER_EMAIL_BODY], response.data[USER_ROLE_BODY], response.data[USER_JWT_TOKEN_EXPIRATION_BODY]);
    console.log(tokenValue);
    authenticationService.authenticationClient.setToken(
        String(response.data[USER_JWT_TOKEN_BODY]),
        tokenValue
    );
} 

function isExpired(expiration: number, response: Response) {
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
                    response = handleAxiosError(error, response);
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
                    Logger.info('User correctly logged in. Saving the token.');
                    saveToken(axiosResponse);
                }
                response.send(axiosResponse.data);
            } catch (error) {
                Logger.error("Error during user's login " + error);
                if (error instanceof AxiosError) {
                    response = handleAxiosError(error, response);
                }
            } finally {
                response.end();
            }
            return;
        }
        case AUTHENTICATE_ACTION: {
            try {
                Logger.info('Checking the validation of the input token');
                const expiration = await authenticationService.authenticationClient.searchToken(request.body[USER_JWT_TOKEN_BODY]);
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
                    response = handleAxiosError(error, response);
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
