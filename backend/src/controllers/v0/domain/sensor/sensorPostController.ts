import { Request, Response } from 'express';
import Logger from 'js-logger';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { sensorService } from './sensorConfig';
import HttpStatus from 'http-status-codes';
import { fromHttpResponseToExpressResponse } from '../../utils/api/responseUtils';

Logger.useDefaults();

const sensorPostHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
    try {
        Logger.info('Received a request for registering a new sensor');
        const httpResponse = await sensorService.registerOperation(endpointPath, request.headers, request.body);
        response = fromHttpResponseToExpressResponse(httpResponse, response);
        response.send(httpResponse.data);
    } catch (error) {
        Logger.error('Error while trying to save a new sensor');
        if (error instanceof Error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorPostHandler };
