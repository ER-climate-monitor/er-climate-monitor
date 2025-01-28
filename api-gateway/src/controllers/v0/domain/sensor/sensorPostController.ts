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


const sensorPostHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
    try {
        Logger.info('Received a request for registering a new sensor');
        const token = String(request.headers[USER_TOKEN_HEADER.toLowerCase()]) || '';
        if (! await sensorService.authenticationClient.isAdminAndNotExpired(token)) {
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        request.headers[API_KEY_HEADER] = SECRET
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
