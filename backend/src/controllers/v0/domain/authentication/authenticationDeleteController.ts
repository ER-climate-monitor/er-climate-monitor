import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { AUTHENTICATION_SERVICE } from '../../../../routes/v0/paths/gatewayPaths';
import { fromHttpResponseToExpressResponse, handleError } from '../../utils/api/responseUtils';
import { Request, Response } from 'express';
import Logger from 'js-logger';
import HttpStatus from 'http-status-codes';
import { authenticationService } from './authenticationConfig';

Logger.useDefaults();

const authenticationDeleteHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, request.url);
    try {
        Logger.info('Requested to delete a user');
        const axiosResponse = await authenticationService.deleteOperation(endpointPath, request.headers, request.body);
        response = fromHttpResponseToExpressResponse(axiosResponse, response);
        response.send(axiosResponse.data);
    } catch (error) {
        Logger.error('Error during delete operation.');
        if (error instanceof Error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { authenticationDeleteHandler };
