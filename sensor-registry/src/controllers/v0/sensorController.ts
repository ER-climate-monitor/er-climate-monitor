import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { isIpValid } from './utils/ipUtils';
import {
    deleteSensor,
    exists,
    findAllSensors,
    getSensorFromName,
    getSensorOfType,
    saveSensor,
    updateSensorName,
} from './utils/sensorUtils';
import {
    ACTION,
    API_KEY_HEADER,
    SENSOR_CRONJOB_DAYS,
    SENSOR_CRONJOB_TIME_HOUR,
    SENSOR_CRONJOB_TIME_MINUTE,
    SENSOR_IP_FIELD,
    SENSOR_NAME,
    SENSOR_PORT_FIELD,
    SENSOR_QUERIES,
    SENSOR_TYPE,
    UPDATE_CRONJOB_DAYS_ACTION,
    UPDATE_CRONJOB_TIME_ACTION,
    UPDATE_NAME_ACTION,
} from '../../model/v0/headers/sensorHeaders';
import dotenv from 'dotenv';
import { fromBody, fromHeaders } from './utils/requestUtils';
import { BasicHttpClient } from './utils/http/httpClient';
import Logger from 'js-logger';
import {
    SHUTDOWN_SENSOR_PATH,
    UPDATE_SENSOR_CRONJOB_DAYS_PATH,
    UPDATE_SENSOR_CRONJOB_TIME_PATH,
    UPDATE_SENSOR_NAME_PATH,
} from '../../routes/v0/paths/physicalSensorPaths';

Logger.useDefaults();

dotenv.config();

const SECRET_API_KEY = String(process.env.SECRET_API_KEY);
const basicHttpClient = new BasicHttpClient();
const MAX_PORT = 65_535;

function isAuthorized(key: string): boolean {
    return key !== '' && key === SECRET_API_KEY;
}

const registerSensor = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        const apikey = fromHeaders(request.headers, API_KEY_HEADER.toLowerCase(), '');
        Logger.info('Received a request for saving a new sensor');
        if (isAuthorized(apikey)) {
            const ip = fromBody(modelData, SENSOR_IP_FIELD, '');
            const port = fromBody(modelData, SENSOR_PORT_FIELD, -1);
            const name = fromBody(modelData, SENSOR_NAME, 'unknown-sensor');
            const type = fromBody(modelData, SENSOR_TYPE, 'unkown');
            const queries = fromBody(modelData, SENSOR_QUERIES, []);
            if (port >= 0 && port <= MAX_PORT && ip != '' && isIpValid(ip)) {
                if (!(await exists(ip, port))) {
                    Logger.info('The sensor does not exists, saving it');
                    await saveSensor(ip, port, name, type, queries);
                    response.status(HttpStatus.CREATED);
                } else {
                    response.status(HttpStatus.CONFLICT);
                }
            } else {
                response.status(HttpStatus.NOT_ACCEPTABLE);
            }
        } else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    } else {
        response.status(HttpStatus.BAD_REQUEST);
    }
    response.end();
};

const allSensors = async (request: Request, response: Response) => {
    const apikey = fromHeaders(request.headers, API_KEY_HEADER.toLowerCase(), '');
    Logger.info('Received a request for returing all the sensors');
    if (apikey !== '' && isAuthorized(apikey)) {
        response.send({ sensors: await findAllSensors() });
    } else {
        response.status(HttpStatus.UNAUTHORIZED);
    }
    response.end();
};

const shutDown = async (request: Request, response: Response) => {
    const apikey = fromHeaders(request.headers, API_KEY_HEADER.toLowerCase(), '');
    Logger.info('Requested to delete a sensor');
    if (apikey !== '' && isAuthorized(apikey)) {
        const ip = String(request.query[SENSOR_IP_FIELD]) || '';
        const port = Number(request.query[SENSOR_PORT_FIELD]) || -1;
        try {
            if ((await exists(ip, port)) && (await deleteSensor(ip, port))) {
                basicHttpClient.deleteSensor(SHUTDOWN_SENSOR_PATH, ip, port).catch((error) => {
                    Logger.error('Error while trying to turning off the sensor.');
                });
                response.status(HttpStatus.OK);
            } else {
                response.status(HttpStatus.NOT_FOUND);
            }
        } catch (error) {
            response.status(HttpStatus.BAD_GATEWAY);
        }
    } else {
        response.status(HttpStatus.UNAUTHORIZED);
    }
    response.end();
};

const updateSensorInfo = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        const apiKey = String(request.headers[API_KEY_HEADER.toLowerCase()]) || '';
        Logger.info('Received a request for updating a sensor, checking if He is authorized');
        if (!modelData || !isAuthorized(apiKey)) {
            response.status(HttpStatus.UNAUTHORIZED);
            return;
        }
        const action: String = fromBody(modelData, ACTION, '');
        const ip = fromBody(modelData, SENSOR_IP_FIELD, '');
        const port = fromBody(modelData, SENSOR_PORT_FIELD, -1);
        if (! await exists(ip, port)) {
            Logger.info('The input sensor was not found.');
            response.status(HttpStatus.NOT_FOUND);
            return;
        }
        Logger.info(`Requested to update the input sensor: ${ip}-${port}`);
        switch (action) {
            case UPDATE_NAME_ACTION: {
                const name = fromBody(modelData, SENSOR_NAME, 'unknown-sensor');
                Logger.info(`Changing the name for the input sensor: ${ip} port: ${port}`);
                basicHttpClient.updateSensorName(UPDATE_SENSOR_NAME_PATH, ip, port, name)
                    .catch((error) => {
                        Logger.error('This was a mock sensor.');
                    });
                await updateSensorName(ip, port, name);
                Logger.info('Name changed correctly');
                return;
            }
            case UPDATE_CRONJOB_DAYS_ACTION: {
                const days = fromBody(modelData, SENSOR_CRONJOB_DAYS, '');
                Logger.info("Received a request for updating the sensor's cronjob days");
                basicHttpClient.updateCronJobDays(UPDATE_SENSOR_CRONJOB_DAYS_PATH, ip, port, days)
                    .catch((error) => {
                        Logger.error('This was a mock sensor.');
                    });
                return;
            }
            case UPDATE_CRONJOB_TIME_ACTION: {
                const hour = fromBody(modelData, SENSOR_CRONJOB_TIME_HOUR, '');
                const minute = fromBody(modelData, SENSOR_CRONJOB_TIME_MINUTE, '');
                Logger.info('Received a new request for updating the sensor cronjob time of work');
                basicHttpClient.updateCronJobTime(UPDATE_SENSOR_CRONJOB_TIME_PATH, ip, port, hour, minute)
                    .catch((error) =>{
                        Logger.info('This was a mock sensor.');
                    })
                return;
            }
            default: {
                Logger.error('Unknown input action: ' + action);
                response.status(HttpStatus.BAD_REQUEST).send({ errorMessage: 'Unknown action to do' });
            }
        }
    } catch (error) {
        Logger.info('Error: ' + error);
        if (error instanceof Error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    } finally {
        response.end();
    }
};

const allSensorsInfo = async (_: Request, response: Response) => {
    findAllSensors()
        .then((sensors) => {
            const infos = Array.from(sensors).map((s) => {
                return { name: s.name, type: s.type, queries: s.queries };
            });
            response.status(HttpStatus.OK).json(infos);
        })
        .catch((err) => response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (err as Error).message }));
};

const allSensorsOfType = async (request: Request, response: Response) => {
    const type = request.query[SENSOR_TYPE];
    if (!type) {
        response
            .status(HttpStatus.BAD_REQUEST)
            .json({ error: 'You must provide a valid sensorType in request query params!' });
    }
    getSensorOfType(type as string).then((res) => {
        if (!res) {
            response.status(HttpStatus.NOT_FOUND).json({ error: `Cannot find a sensor with type ${type}` });
        } else {
            response.status(HttpStatus.OK).json(res);
        }
    });
};

export { registerSensor, allSensors, shutDown, allSensorsInfo, allSensorsOfType, updateSensorInfo };
