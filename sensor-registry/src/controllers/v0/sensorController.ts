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
} from './utils/sensorUtils';
import {
    API_KEY_FIELD,
    SENSOR_IP_FIELD,
    SENSOR_NAME,
    SENSOR_PORT_FIELD,
    SENSOR_QUERIES,
    SENSOR_TYPE,
} from '../../model/v0/headers/sensorHeaders';
import dotenv from 'dotenv';
import { fromBody, fromHeaders } from './utils/requestUtils';
import { BasicHttpClient } from './utils/http/httpClient';
import Logger from "js-logger";
import { SHUT_DOWN_PATH } from '../../routes/v0/paths/sensorPaths';

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
        const apikey = fromHeaders(request.headers, API_KEY_FIELD.toLowerCase(), '');
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
    const apikey = fromHeaders(request.headers, API_KEY_FIELD.toLowerCase(), '');
    Logger.info('Received a request for returing all the sensors');
    if (apikey !== '' && isAuthorized(apikey)) {
        response.send({ sensors: await findAllSensors() });
    } else {
        response.status(HttpStatus.UNAUTHORIZED);
    }
    response.end();
};

const shutDown = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        const apikey = fromHeaders(request.headers, API_KEY_FIELD.toLowerCase(), '');
        if (apikey !== '' && isAuthorized(apikey)) {
            Logger.info('Received a request for shutting of a sensor');
            const ip = fromBody(modelData, SENSOR_IP_FIELD, '');
            const port = fromBody(modelData, SENSOR_PORT_FIELD, -1);
            basicHttpClient.deleteSensor(SHUT_DOWN_PATH, ip, port);
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

export { registerSensor, allSensors, shutDown, allSensorsInfo, allSensorsOfType };
