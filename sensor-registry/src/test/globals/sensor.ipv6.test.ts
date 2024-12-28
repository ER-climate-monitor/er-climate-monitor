import { describe } from "mocha"
import request from "supertest";
import createServer from "../..";
import dotenv from 'dotenv';
import HttpStatus from "http-status-codes";
import { shutOffSensor } from "./utils/sensorUtils";
import { fail } from "assert";
import { ISensor, SensorDocument } from "../../model/sensorModel";
import randomIpv6 from "random-ipv6";
import { deleteSensor } from "../../controllers/utils/sensorUtils";

dotenv.config();

const REGISTER_SENSOR_PATH = "/sensor/register";
const ALL_SENSORS = "/sensor/all";

const SENSOR_PORT_HEADER = String(process.env.SENSOR_PORT_HEADER);
const SENSOR_IP_HEADER = String(process.env.SENSOR_IP_HEADER);
const API_KEY_HEADER = String(process.env.API_KEY_HEADER);
const SECRET_API_KEY = String(process.env.SECRET_API_KEY);
const MAX_PORT = 65_535;

const sensorIp = "2001:db8:3333:4444:5555:6666:7777:8888";
const sensorPort = 1926;

const sensorInfomration = {
    [SENSOR_IP_HEADER]: sensorIp,
    [SENSOR_PORT_HEADER]: sensorPort,
    [API_KEY_HEADER]: SECRET_API_KEY
}

const app = createServer();

function createSensor(ip: string, port: number) {
    return {
            [SENSOR_IP_HEADER]: ip,
            [SENSOR_PORT_HEADER]: port,
            [API_KEY_HEADER]: SECRET_API_KEY
    }
}

describe("Registering a new Sensor using IPv6", () => {
    before(async () => {
        await shutOffSensor(app, sensorInfomration);
    });
    it("Registering a new Sensor using an IPv6 and using a PORT that are not used should be OK", async () => {
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
    });
    it("Registering a sensor with same IPv6 and different port should be ok", async () => {
        const other = createSensor(sensorIp, 1000);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(other)
            .expect(HttpStatus.CREATED)
        await shutOffSensor(app, other);
    });
    it("Registering a sensor with different IPv6 and same port should be ok.", async () => {
        const other = createSensor(randomIpv6(), sensorPort);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(other)
            .expect(HttpStatus.CREATED);
    });
    it("Registering a sensor with different types of IPv6 should be ok.", async () => {
        const ips= Array<string>();
        ips.push(randomIpv6('{token}::1', {padded: true, token:{ min: 0, max: 65535 }}));
        ips.push(randomIpv6('{token}:0:0:0:0:1:0:0', { compressed: true, token:{ min: 0, max: 65535 }}));
        for (const ip of ips) {
            await request(app)
                .post(REGISTER_SENSOR_PATH)
                .send(createSensor(ip, sensorPort))
                .expect(HttpStatus.CREATED);
        }
    });
    it("Registering a sensor with a wrong IPv6 should raise an error.", async() => {
        const baseIP = "2c56:9a76:aee6:3552:855a:f757:3611:255a"
        const sensors = Array();
        sensors.push(createSensor("fe80:2030:31:24", sensorPort));
        for (let i = 0; i < 8; i+= 1) {
            const ip = baseIP.split(':');
            ip[i] = "ABCG"
            const newIp = ip.join(':');
            sensors.push(createSensor(newIp, sensorPort));
        }
        for (const sensor of sensors) {
            await request(app)
                .post(REGISTER_SENSOR_PATH)
                .send(sensor)
                .expect(HttpStatus.NOT_ACCEPTABLE);
        }

    });
    it("After registering a new sensor It should be possible to see It saved.", async () => {   
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .get(ALL_SENSORS)
            .send({[API_KEY_HEADER]: SECRET_API_KEY})
            .expect(res => {
                const sensors: Array<ISensor> = res.body['sensors'];
                const saved = sensors.find(sensor => sensor.ip == sensorIp && sensor.port == sensorPort);
                if (!saved) {
                    fail("The input sensor is not saved.");
                }
            });
    });
    it("Registering a sensor with same Ip and same Port of another sensor should return a conflict", async () => {
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CONFLICT);
    });
    afterEach(async () => {
        await shutOffSensor(app, sensorInfomration);
    });
});