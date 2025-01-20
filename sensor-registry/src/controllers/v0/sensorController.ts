import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { isIpValid } from './utils/ipUtils';
import { deleteSensor, exists, findAllSensors, getSensorFromName, saveSensor } from './utils/sensorUtils';
import {
    API_KEY_FIELD,
    SENSOR_IP_FIELD,
    SENSOR_NAME,
    SENSOR_PORT_FIELD,
    SENSOR_QUERIES,
} from '../../model/v0/headers/sensorHeaders';
import dotenv from 'dotenv';
import { fromBody } from './utils/requestUtils';
import Logger from 'js-logger';

Logger.useDefaults();

dotenv.config();

const SECRET_API_KEY = String(process.env.SECRET_API_KEY);
console.log(SECRET_API_KEY);
const MAX_PORT = 65_535;

function isAuthorized(key: string): boolean {
    return key !== '' && key === SECRET_API_KEY;
}

const registerSensor = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        const apikey = fromBody(modelData, API_KEY_FIELD, '');
        Logger.info('Received a request for saving a new sensor');
        if (isAuthorized(apikey)) {
            const ip = fromBody(modelData, SENSOR_IP_FIELD, '');
            const port = fromBody(modelData, SENSOR_PORT_FIELD, -1);
            const name = fromBody(modelData, SENSOR_NAME, 'unknown-sensor');
            const queries = fromBody(modelData, SENSOR_QUERIES, []);
            if (port >= 0 && port <= MAX_PORT && ip != '' && isIpValid(ip)) {
                if (!(await exists(ip, port))) {
                    Logger.info('The sensor does not exists, saving it');
                    await saveSensor(ip, port, name, queries);
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
    const modelData = request.body;
    const apikey = fromBody(modelData, API_KEY_FIELD, '');
    Logger.info('Received a request for returing all the sensors');
    Logger.info('AAAAA: ', apikey);
    if (isAuthorized(apikey)) {
        response.send({ sensors: await findAllSensors() });
    } else {
        response.status(HttpStatus.UNAUTHORIZED);
    }
    response.end();
};

const shutOff = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        const apikey = fromBody(modelData, API_KEY_FIELD, '');
        if (isAuthorized(apikey)) {
            Logger.info('Received a request for shutting of a sensor');
            const ip = fromBody(modelData, SENSOR_IP_FIELD, '');
            const port = fromBody(modelData, SENSOR_PORT_FIELD, -1);
            if ((await exists(ip, port)) && (await deleteSensor(ip, port))) {
                response.status(HttpStatus.OK);
            } else {
                response.status(HttpStatus.NOT_FOUND);
            }
        } else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    } else {
        response.status(HttpStatus.BAD_REQUEST);
    }
    response.end();
};

const allQueriesForSensor = async (request: Request, response: Response) => {
    const sensorName = request.query[SENSOR_NAME];
    if (!sensorName) {
        response.status(HttpStatus.BAD_REQUEST).json({ error: "You must provide a 'sensorName' in the request body" });
        return;
    }

    getSensorFromName(sensorName as string)
        .then((res) => {
            if (!res) {
                response
                    .status(HttpStatus.NOT_FOUND)
                    .json({ error: `Sensor with name '${sensorName}' has not been found!` });
            } else {
                response.status(HttpStatus.OK).json(res.queries);
            }
        })
        .catch((err: Error) =>
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: `Something went wrong: ${err.message}` }),
        );
};

export { registerSensor, allSensors, shutOff, allQueriesForSensor };
