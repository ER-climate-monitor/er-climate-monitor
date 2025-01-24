import { Request, Response } from "express";
import { sensorService } from "./sensorConfig";
import { API_KEY_HEADER } from "../../../../models/v0/sensor/headers/sensorHeaders";
import HttpStatus from 'http-status-codes';
import Logger from "js-logger";

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
        Logger.info('Forwarding the request to the sensor registry service.');

    } catch (error) {

    } finally {
        response.end();
    }
};

export { sensorPutHandler }