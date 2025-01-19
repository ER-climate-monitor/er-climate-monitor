import { Request, Response } from 'express';
import Logger from 'js-logger';
import { SensorService } from '../../../../service/v0/sensor/sensorService';
import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';
import { removeServiceFromUrl } from '../../utils/api/urlUtils';
import { fromAxiosToResponse, handleAxiosError } from '../../utils/api/responseUtils';
import { AxiosError } from 'axios';
import { AbstractService } from '../../../../service/v0/abstractService';
import { sensorService } from './sensorConfig';

Logger.useDefaults();

const sensorPostHandler = async (request: Request, response: Response, service: AbstractService<any, any>) => {
    const endpointPath = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
    try {
        const axiosResponse = await sensorService.registerOperation(endpointPath, request.headers, request.body);
        response = fromAxiosToResponse(axiosResponse, response);
        response.send(axiosResponse.data);
    } catch (error) {
        if (error instanceof AxiosError) {
            response = handleAxiosError(error, response);
        }
    } finally {
        response.end();
    }
};

export { sensorPostHandler };
