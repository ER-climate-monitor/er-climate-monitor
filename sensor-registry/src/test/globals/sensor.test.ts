import { describe } from "mocha"
import request from "supertest";
import createServer from "../..";
import dotenv from 'dotenv';
import HttpStatus from "http-status-codes";
import { shutOffSensor } from "./utils/sensorUtils";

dotenv.config();

const REGISTER_SENSOR_PATH = "/sensor/register";

const SENSOR_PORT_HEADER = String(process.env.SENSOR_PORT_HEADER);
const SENSOR_IP_HEADER = String(process.env.SENSOR_IP_HEADER);
const API_KEY_HEADER = String(process.env.API_KEY_HEADER);
const API_KEY = String(process.env.API_KEY);
const MAX_PORT = 65_535;

const sensorIp = "0.0.0.0";
const sensorPort = 1926;

const sensorInfomration = {
    [SENSOR_IP_HEADER]: sensorIp,
    [SENSOR_PORT_HEADER]: sensorPort,
    [API_KEY_HEADER]: API_KEY
}

const app = createServer();

describe("Registering a new Sensor", () => {
    before(async () => {
        await shutOffSensor(app, sensorInfomration);
    })
    it("Registering a new Sensor that does not exists inside the database should be OK", async () =>{
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
    });
    it("Registering a new Sensor without specifying an API KEY or by using a wrong API Key should return an error", async () => {
        const noAPI = {
            [SENSOR_IP_HEADER]: sensorIp,
            [SENSOR_PORT_HEADER]: sensorPort
        };
        const wrongAPI = {
            [SENSOR_IP_HEADER]: sensorIp,
            [SENSOR_PORT_HEADER]: sensorPort,
            [API_KEY_HEADER]: ""
        }
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(noAPI)
            .expect(HttpStatus.UNAUTHORIZED);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(wrongAPI)
            .expect(HttpStatus.UNAUTHORIZED);
    });
    afterEach(async () => {
        await shutOffSensor(app, sensorInfomration);
    })
});