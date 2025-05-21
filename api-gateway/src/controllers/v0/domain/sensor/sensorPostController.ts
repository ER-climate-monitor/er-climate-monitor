import { Request, Response } from 'express';
import Logger from 'js-logger';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { sensorService } from './sensorConfig';
import HttpStatus from 'http-status-codes';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';
import { USER_TOKEN_HEADER } from '../../../../models/v0/authentication/headers/authenticationHeaders';
import { API_KEY_HEADER } from '../../../../models/v0/sensor/headers/sensorHeaders';

Logger.useDefaults();
const SECRET = String(process.env.SECRET_API_KEY);

/**
 * Sensor POST controller
 * @param {Request} request - The input user's request.
 * @param {Response} response - The server's response.
 * @returns {Promise<void>} Handle the input user's request regarding a POST to the Sensor Registry service.
 */
const sensorPostHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
    try {
        Logger.info('Received a request for registering a new sensor');
        if (
            !(USER_TOKEN_HEADER.toLocaleLowerCase() in request.headers) &&
            !(API_KEY_HEADER.toLocaleLowerCase() in request.headers)
        ) {
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        const token =
            USER_TOKEN_HEADER.toLocaleLowerCase() in request.headers
                ? String(request.headers[USER_TOKEN_HEADER.toLowerCase()])
                : undefined;
        const apiKey =
            API_KEY_HEADER.toLowerCase() in request.headers
                ? String(request.headers[API_KEY_HEADER.toLowerCase()])
                : undefined;
        if (token !== undefined && !(await sensorService.authenticationClient.isAdminAndNotExpired(token))) {
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        if (token === undefined && (apiKey === undefined || apiKey !== SECRET)) {
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        request.headers[API_KEY_HEADER] = SECRET;
        const httpResponse = await sensorService.registerOperation(endpointPath, request.headers, request.body);
        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
    } catch (error) {
        Logger.error('Error while trying to save a new sensor');
        if (error instanceof Error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorPostHandler };
