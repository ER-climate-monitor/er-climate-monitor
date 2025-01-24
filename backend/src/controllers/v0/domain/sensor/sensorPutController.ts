import { Request, Response } from "express";
import { sensorService } from "./sensorConfig";
import { API_KEY_HEADER } from "../../../../models/v0/sensor/headers/sensorHeaders";
import HttpStatus from 'http-status-codes';
import Logger from "js-logger";
import { removeServiceFromUrl } from "../../utils/api/urlUtils";
import { SENSOR_REGISTRY_ENDPOINT } from "../../../../models/v0/serviceModels";

Logger.useDefaults();


const sensorPutHandler = async (request: Request, response: Response) => {
    try {
        Logger.info('Requested to update the input sensor');
        const token = String(request.headers[API_KEY_HEADER.toLowerCase()]) || '';
        if (!sensorService.authenticationClient.isAdminAndNotExpired(token)){
            Logger.info('The input user is not authorized.');
            response.status(HttpStatus.UNAUTHORIZED);
            return
        }
        const endpoint = removeServiceFromUrl(SENSOR_REGISTRY_ENDPOINT, request.url);
        Logger.info('Forwarding the request to the sensor registry service.');
        await sensorService.updateRemoteSensor(endpoint, request.header, request.body);
    } catch (error) {
        Logger.error('There was an error while trying to update a sensor');
        if (error instanceof Error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    } finally {
        response.end();
    }
};

export { sensorPutHandler }