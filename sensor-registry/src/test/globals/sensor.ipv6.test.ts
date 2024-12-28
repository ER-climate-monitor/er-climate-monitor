import { describe } from "mocha"
import request from "supertest";
import createServer from "../..";
import dotenv from 'dotenv';
import HttpStatus from "http-status-codes";
import { shutOffSensor } from "./utils/sensorUtils";
import { fail } from "assert";
import { ISensor, SensorDocument } from "../../model/sensorModel";
import randomIpv6 from "random-ipv6";

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
    afterEach(async () => {
        await shutOffSensor(app, sensorInfomration);
    });
});