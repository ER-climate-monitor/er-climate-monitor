import { Request, Response } from 'express';
import { sensorService } from './sensorConfig';
import { USER_TOKEN_HEADER } from '../../../../models/v0/authentication/headers/authenticationHeaders';
import HttpStatus from 'http-status-codes';
import Logger from 'js-logger';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { API_KEY_HEADER } from '../../../../models/v0/sensor/headers/sensorHeaders';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';

Logger.useDefaults();
const SECRET = String(process.env.SECRET_API_KEY);

/**
 * @param {Request} request - The input user's request.
 * @param {Response} response - The server's response.
 * @returns {Promise<void>} Handle the input user's request regarding a PUT to the Sensor Registry.
 */
const sensorPutHandler = async (request: Request, response: Response) => {
    try {
        Logger.info('Requested to update the input sensor');
        const token = String(request.headers[USER_TOKEN_HEADER.toLowerCase()]) || '';
        if (!(await sensorService.authenticationClient.isAdminAndNotExpired(token))) {
            Logger.info('The input user is not authorized.');
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        const endpoint = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
        request.headers[API_KEY_HEADER] = SECRET;
        Logger.info('Forwarding the request to the sensor registry service.');
        const httpResponse = await sensorService.updateRemoteSensor(endpoint, request.headers, request.body);
        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
        Logger.info('The updating is done');
    } catch (error) {
        Logger.error('There was an error while trying to update a sensor');
        if (error instanceof Error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorPutHandler };
