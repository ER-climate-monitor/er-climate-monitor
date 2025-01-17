import { AUTHENTICATION_ENDPOINT } from '../../../../models/v0/serviceModels';
import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';
import { AuthenticationService } from '../../../../service/authentication/authenticationService';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../../../routes/v0/paths/gatewayPaths';
import { fromAxiosToResponse, handleAxiosError } from '../../utils/api/responseUtils';
import { Request, Response } from 'express';
import Logger from 'js-logger';
import { AxiosError } from 'axios';

Logger.useDefaults();
const breaker = BreakerFactory.axiosBreakerWithDefaultOptions();
const authenticationService = new AuthenticationService(breaker, AUTHENTICATION_ENDPOINT);
const authenticationDeleteHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, request.url);
    try {
        const axiosResponse = await authenticationService.deleteOperation(
            endpointPath,
            request.headers,
            request.headers,
        );
        response = fromAxiosToResponse(axiosResponse, response);
        response.send(axiosResponse.data);
    } catch (error) {
        Logger.error('Error during delete operation.');
        if (error instanceof AxiosError) {
            response = handleAxiosError(error, response);
        }
    } finally {
        response.end();
    }
};

export { authenticationDeleteHandler };
