import { Request, Response } from 'express';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { sensorService } from './sensorConfig';
import Logger from 'js-logger';
import { USER_TOKEN_HEADER } from '../../../../models/v0/authentication/headers/authenticationHeaders';
import HttpStatus from 'http-status-codes';
import { API_KEY_HEADER } from '../../../../models/v0/sensor/headers/sensorHeaders';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';

Logger.useDefaults();
const SECRET = String(process.env.SECRET_API_KEY);

const sensorGetHandler = async (request: Request, response: Response) => {
    let endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
    try {
        Logger.info('Requested to get all the sensors');
        const jwtToken = String(request.headers[USER_TOKEN_HEADER.toLowerCase()]);

        const isExpired = await sensorService.authenticationClient.isExpired(jwtToken);

        if (isExpired) {
            Logger.info('The token is expired');
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        if (await sensorService.authenticationClient.isAdmin(jwtToken)) {
            request.headers[API_KEY_HEADER.toLowerCase()] = SECRET;
            const httpResponse = await sensorService.getAllSensorsOperation(
                endpointPath,
                request.headers,
                request.body,
            );
            response = fromHttpResponseToExpressResponse(httpResponse, response);
            response.send(httpResponse.data);
        } else {
            endpointPath = endpointPath.replace('all', 'infos');
            const httpResponse = await sensorService.getAllSensorsOperation(
                endpointPath,
                request.headers,
                request.body,
            );
            response = fromHttpResponseToExpressResponse(httpResponse, response);
            response.send(httpResponse.data);
        }
    } catch (error) {
        Logger.info('Error while trying to return all the different sensors');
        if (error instanceof Error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorGetHandler };
