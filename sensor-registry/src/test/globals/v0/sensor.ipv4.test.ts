import request from 'supertest';
import createServer from '../../..';
import dotenv from 'dotenv';
import HttpStatus from 'http-status-codes';
import { shutOffSensor, createSensor } from './utils/sensorUtils';
import { fail } from 'assert';
import { ISensor } from '../../../model/v0/sensorModel';
import {
    SENSOR_IP_FIELD,
    SENSOR_PORT_FIELD,
    API_KEY_FIELD,
    SENSOR_NAME,
    SENSOR_QUERIES,
} from '../../../model/v0/headers/sensorHeaders';
import { ALL_ROUTE, BASE_SENSOR_PATH_V0, QUERIES_PATH, REGISTER_ROUTE } from '../../../routes/v0/paths/sensorPaths';
import { beforeEach, it, describe } from 'mocha';

dotenv.config();

const SECRET_API_KEY = String(process.env.SECRET_API_KEY);

const REGISTER_SENSOR_PATH = REGISTER_ROUTE;
const ALL_SENSORS = ALL_ROUTE;

const MAX_PORT = 65_535;

const sensorIp = '0.0.0.0';
const sensorPort = 1926;
const sensorName = 'napoli-sensor';
const sensorQueries = ['25%-threshold', '50%-threshold', '75%-threshold', '100%-threshold'];

const sensorInformation = {
    [SENSOR_IP_FIELD]: sensorIp,
    [SENSOR_PORT_FIELD]: sensorPort,
    [SENSOR_NAME]: sensorName,
    [SENSOR_QUERIES]: sensorQueries,
    [API_KEY_FIELD]: SECRET_API_KEY,
};

const app = createServer();

describe('Registering a new Sensor using IPv4', () => {
    beforeEach(async () => {
        await shutOffSensor(app, sensorInformation);
    });
    it('Registering a new Sensor that does not exists inside the database should be OK', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
    });
    it('Registering a new Sensor without specifying an API KEY or by using a wrong API Key should return an error', async () => {
        const noAPI = {
            [SENSOR_IP_FIELD]: sensorIp,
            [SENSOR_PORT_FIELD]: sensorPort,
        };
        const wrongAPI = {
            [SENSOR_IP_FIELD]: sensorIp,
            [SENSOR_PORT_FIELD]: sensorPort,
            [API_KEY_FIELD]: '',
        };
        await request(app).post(REGISTER_SENSOR_PATH).send(noAPI).expect(HttpStatus.UNAUTHORIZED);
        await request(app).post(REGISTER_SENSOR_PATH).send(wrongAPI).expect(HttpStatus.UNAUTHORIZED);
    });
    it('Registering a sensor with a duplicate pair IP-Port should return an error', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CONFLICT);
    });
    it('Registering a sensor with same IP but different port should be OK', async () => {
        const similarSensor = {
            [SENSOR_IP_FIELD]: sensorIp,
            [SENSOR_PORT_FIELD]: 777,
            [API_KEY_FIELD]: SECRET_API_KEY,
        };
        await shutOffSensor(app, similarSensor);
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
        await request(app).post(REGISTER_SENSOR_PATH).send(similarSensor).expect(HttpStatus.CREATED);
        await shutOffSensor(app, similarSensor);
    });
    it('Registering a sensor with same Port but differnt IP should be OK', async () => {
        const similarSensor = {
            [SENSOR_IP_FIELD]: '1.0.0.0',
            [SENSOR_PORT_FIELD]: 777,
            [API_KEY_FIELD]: SECRET_API_KEY,
        };
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
        await request(app).post(REGISTER_SENSOR_PATH).send(similarSensor).expect(HttpStatus.CREATED);
        await shutOffSensor(app, similarSensor);
    });
    it('Delete an existing sensor should be OK', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
        await shutOffSensor(app, sensorInformation);
    });
    it('Get all the sensors without using the Secret Key should return an error.', async () => {
        await request(app).get(ALL_SENSORS).expect(HttpStatus.UNAUTHORIZED);
    });
    it('Register a sensor and query for all the sensors should be able to find the registered sensor', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
        await request(app)
            .get(ALL_SENSORS)
            .send({ [API_KEY_FIELD]: SECRET_API_KEY })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const allSensors: Array<ISensor> = res.body['sensors'];
                const exist = allSensors.find((sensor) => sensor['ip'] == sensorIp && sensor['port'] == sensorPort);
                if (!exist) {
                    fail('The sensor is not registered.');
                }
            });
    });
    it('Registering a Sensor with a port < 0 or > MAX_PORT should return an error.', async () => {
        const wrongSensor = {
            [SENSOR_IP_FIELD]: sensorIp,
            [SENSOR_PORT_FIELD]: -1,
            [API_KEY_FIELD]: SECRET_API_KEY,
        };
        await request(app).post(REGISTER_SENSOR_PATH).send(wrongSensor).expect(HttpStatus.NOT_ACCEPTABLE);
        wrongSensor[SENSOR_PORT_FIELD] = MAX_PORT + 1;
        await request(app).post(REGISTER_SENSOR_PATH).send(wrongSensor).expect(HttpStatus.NOT_ACCEPTABLE);
    });
    it('Registering a Sensor with a wrong IP should return an error.', async () => {
        const ip: string = '0.0.0.0';
        const wrongSensors = [createSensor('localhost', 10, 'wrong-sensor-1', [])];
        for (let i = 0; i < 4; i++) {
            const wrongIp = ip.split('.');
            wrongIp[i] = '256';
            wrongSensors.push(createSensor(wrongIp.join('.'), 10, 'wrong-sensor-2', []));
        }
        for (const sensor of wrongSensors) {
            await request(app).post(REGISTER_SENSOR_PATH).send(sensor).expect(HttpStatus.NOT_ACCEPTABLE);
        }
    });

    it('It should be possibile to retrieve all queries by sensor name for an existing sensor.', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInformation).expect(HttpStatus.CREATED);
        await request(app)
            .get(BASE_SENSOR_PATH_V0 + QUERIES_PATH + `?${SENSOR_NAME}=${sensorName}`)
            .expect((res) => {
                if (res.status !== HttpStatus.OK) {
                    fail(`Something went wrong (HTTP 1.1: ${res.status}): ${JSON.stringify(res)}`);
                }
                const queries: string[] = res.body;
                if (!(queries.length === sensorQueries.length)) {
                    fail(`Expected exactly ${sensorQueries.length} queries but got: ${queries.length}`);
                }
            });
    });
});
