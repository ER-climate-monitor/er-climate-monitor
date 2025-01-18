import request from 'supertest';
import createServer from '../../..';
import dotenv from 'dotenv';
import HttpStatus from 'http-status-codes';
import { shutOffSensor, createSensor } from './utils/sensorUtils';
import { fail } from 'assert';
import { ISensor } from '../../../model/v0/sensorModel';
import randomIpv6 from 'random-ipv6';
import { SENSOR_IP_FIELD, SENSOR_PORT_FIELD, API_KEY_FIELD } from '../../../model/v0/headers/sensorHeaders';
import { ALL_ROUTE, REGISTER_ROUTE } from '../../../routes/v0/paths/sensorPaths';
import { beforeEach, it, describe } from 'mocha';

dotenv.config();

const REGISTER_SENSOR_PATH = REGISTER_ROUTE;
const ALL_SENSORS = ALL_ROUTE;

const SECRET_API_KEY = String(process.env.SECRET_API_KEY);
const MAX_PORT = 65_535;

const sensorIp = '2001:db8:3333:4444:5555:6666:7777:8888';
const sensorPort = 1926;

const sensorInfomration = {
    [SENSOR_IP_FIELD]: sensorIp,
    [SENSOR_PORT_FIELD]: sensorPort,
    [API_KEY_FIELD]: SECRET_API_KEY,
};

const app = createServer();

describe('Registering a new Sensor using IPv6', () => {
    beforeEach(async () => {
        await shutOffSensor(app, sensorInfomration);
    });
    it('Registering a new Sensor using an IPv6 and using a PORT that are not used should be OK', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInfomration).expect(HttpStatus.CREATED);
    });
    it('Registering a sensor with same IPv6 and different port should be ok', async () => {
        const other = createSensor(sensorIp, 1000);
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInfomration).expect(HttpStatus.CREATED);
        await request(app).post(REGISTER_SENSOR_PATH).send(other).expect(HttpStatus.CREATED);
        await shutOffSensor(app, other);
    });
    it('Registering a sensor with different IPv6 and same port should be ok.', async () => {
        const other = createSensor(randomIpv6(), sensorPort);
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInfomration).expect(HttpStatus.CREATED);
        await request(app).post(REGISTER_SENSOR_PATH).send(other).expect(HttpStatus.CREATED);
        await shutOffSensor(app, other);
    });
    it('Registering a sensor with different types of IPv6 should be ok.', async () => {
        const ips = Array<string>();
        ips.push(randomIpv6('{token}::1', { padded: true, token: { min: 0, max: 65535 } }));
        ips.push(randomIpv6('{token}:0:0:0:0:1:0:0', { compressed: true, token: { min: 0, max: 65535 } }));
        for (const ip of ips) {
            const sensor = createSensor(ip, sensorPort);
            await request(app).post(REGISTER_SENSOR_PATH).send(sensor).expect(HttpStatus.CREATED);
            await shutOffSensor(app, sensor);
        }
    });
    it('Registering a sensor with a wrong IPv6 should raise an error.', async () => {
        const baseIP = '2c56:9a76:aee6:3552:855a:f757:3611:255a';
        const sensors = [];
        sensors.push(createSensor('fe80:2030:31:24', sensorPort));
        for (let i = 0; i < 8; i += 1) {
            const ip = baseIP.split(':');
            ip[i] = 'ABCG';
            const newIp = ip.join(':');
            sensors.push(createSensor(newIp, sensorPort));
        }
        for (const sensor of sensors) {
            await request(app).post(REGISTER_SENSOR_PATH).send(sensor).expect(HttpStatus.NOT_ACCEPTABLE);
        }
    });
    it('Registering a sensor with a wrong PORT value should return an error', async () => {
        const sensors = [];
        sensors.push(createSensor(sensorIp, MAX_PORT + 1));
        sensors.push(createSensor(sensorIp, -1));
        for (const sensor of sensors) {
            await request(app).post(REGISTER_SENSOR_PATH).send(sensor).expect(HttpStatus.NOT_ACCEPTABLE);
        }
    });
    it('After registering a new sensor It should be possible to see It saved.', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInfomration).expect(HttpStatus.CREATED);
        await request(app)
            .get(ALL_SENSORS)
            .send({ [API_KEY_FIELD]: SECRET_API_KEY })
            .expect((res) => {
                const sensors: Array<ISensor> = res.body['sensors'];
                const saved = sensors.find((sensor) => sensor.ip == sensorIp && sensor.port == sensorPort);
                if (!saved) {
                    fail('The input sensor is not saved.');
                }
            });
    });
    it('Registering a sensor with same Ip and same Port of another sensor should return a conflict', async () => {
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInfomration).expect(HttpStatus.CREATED);
        await request(app).post(REGISTER_SENSOR_PATH).send(sensorInfomration).expect(HttpStatus.CONFLICT);
    });
    afterEach(async () => {
        await shutOffSensor(app, sensorInfomration);
    })
});
