import { Request, Response } from 'express';
import { sensorService } from './sensorConfig';
import { USER_JWT_TOKEN_BODY } from '../../../../models/v0/authentication/headers/authenticationHeaders';
import { API_KEY_HEADER } from '../../../../models/v0/sensor/headers/sensorHeaders';
import Logger from 'js-logger';
import HttpStatus from 'http-status-codes';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';
Logger.useDefaults();

const SECRET = String(process.env.SECRET_API_KEY);

const sensorDeleteHandler = async (request: Request, response: Response) => {
    try {
        Logger.info('Received a request for deleting a sensor');
        const endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
        const jwtToken = String(request.headers[USER_JWT_TOKEN_BODY.toLowerCase()]);
        if (jwtToken === null || !(await sensorService.authenticationClient.isAdmin(jwtToken))) {
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        Logger.info('The user is an admin, we can procede');
        request.headers[API_KEY_HEADER.toLowerCase()] = SECRET;
        const httpResponse = await sensorService.deleteOperation(endpointPath, request.headers, request.body);
        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
    } catch (error) {
        Logger.error('Something went wrong while trying for deleting a sensor');
        if (error instanceof Error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorDeleteHandler };
