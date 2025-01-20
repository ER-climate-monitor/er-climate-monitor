import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../../../routes/v0/paths/gatewayPaths';
import { fromAxiosToResponse, handleAxiosError } from '../../utils/api/responseUtils';
import { Request, Response } from 'express';
import Logger from 'js-logger';
import { AxiosError, HttpStatusCode } from 'axios';
import { authenticationService } from './authenticationConfig';

Logger.useDefaults();

const authenticationDeleteHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, request.url);
    try {
        Logger.info('Requested to delete a user');
        const axiosResponse = await authenticationService.deleteOperation(
            endpointPath,
            request.headers,
            request.body,
        );
        response = fromAxiosToResponse(axiosResponse, response);
        response.send(axiosResponse.data);
    } catch (error) {
        Logger.error('Error during delete operation.');
        if (error instanceof AxiosError && error.request !== null) {
            response = handleAxiosError(error, response);
        } else if (error instanceof Error) {
            response.status(HttpStatusCode.BadRequest).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { authenticationDeleteHandler };
