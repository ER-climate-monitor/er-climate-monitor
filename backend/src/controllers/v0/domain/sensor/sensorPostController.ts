import { Request, Response } from 'express';
import Logger from 'js-logger';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { fromAxiosToResponse, handleAxiosError } from '../../utils/api/responseUtils';
import { AxiosError, HttpStatusCode } from 'axios';
import { sensorService } from './sensorConfig';

Logger.useDefaults();

const sensorPostHandler = async (request: Request, response: Response) => {
    const endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
    try {
        Logger.info('Received a request for registering a new sensor');
        const axiosResponse = await sensorService.registerOperation(endpointPath, request.headers, request.body);
        response = fromAxiosToResponse(axiosResponse, response);
        response.send(axiosResponse.data);
    } catch (error) {
        Logger.error('Error while trying to save a new sensor');
        if (error instanceof AxiosError) {
            response = handleAxiosError(error, response);
        } else if (error instanceof Error) {
            response.status(HttpStatusCode.BadRequest).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorPostHandler };
