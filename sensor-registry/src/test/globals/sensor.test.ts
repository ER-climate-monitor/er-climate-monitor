import { describe } from "mocha"
import request from "supertest";
import createServer from "../..";
import dotenv from 'dotenv';
import HttpStatus from "http-status-codes";
import { shutOffSensor } from "./utils/sensorUtils";
import { fail } from "assert";
import { ISensor, SensorDocument } from "../../model/sensorModel";

dotenv.config();

const REGISTER_SENSOR_PATH = "/sensor/register";
const ALL_SENSORS = "/sensor/all";

const SENSOR_PORT_HEADER = String(process.env.SENSOR_PORT_HEADER);
const SENSOR_IP_HEADER = String(process.env.SENSOR_IP_HEADER);
const API_KEY_HEADER = String(process.env.API_KEY_HEADER);
const SECRET_API_KEY = String(process.env.SECRET_API_KEY);
const MAX_PORT = 65_535;

const sensorIp = "0.0.0.0";
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
    it("Registering a sensor with a duplicate pair IP-Port should return an error", async() => {
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CONFLICT);
    });
    it("Registering a sensor with same IP but different port should be OK", async () => {
        const similarSensor = {
            [SENSOR_IP_HEADER]: "0.0.0.0",
            [SENSOR_PORT_HEADER]: 777,
            [API_KEY_HEADER]: SECRET_API_KEY
        };
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(similarSensor)
            .expect(HttpStatus.CREATED);
        await shutOffSensor(app, similarSensor);
    });
    it("Registering a sensor with same Port but differnt IP should be OK", async () => {
        const similarSensor = {
            [SENSOR_IP_HEADER]: "1.0.0.0",
            [SENSOR_PORT_HEADER]: 777,
            [API_KEY_HEADER]: SECRET_API_KEY
        };
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(similarSensor)
            .expect(HttpStatus.CREATED);
        await shutOffSensor(app, similarSensor);
    });
    it("Delete an existing sensor should be OK", async () => {
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await shutOffSensor(app, sensorInfomration);
    });
    it("Get all the sensors without using the Secret Key should return an error.", async () => {
        await request(app)
            .get(ALL_SENSORS)
            .expect(HttpStatus.UNAUTHORIZED);
    });
    it("Register a sensor and query for all the sensors should be able to find the registered sensor", async () => {
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(sensorInfomration)
            .expect(HttpStatus.CREATED);
        await request(app)
            .get(ALL_SENSORS)
            .send({[API_KEY_HEADER]: SECRET_API_KEY})
            .expect(HttpStatus.OK)
            .expect(res => {
                const allSensors:Array<ISensor> = res.body['sensors'];
                const exist = allSensors.find(sensor => sensor['ip'] == sensorIp && sensor['port'] == sensorPort);
                if (!exist) {
                    fail("The sensor is not registered.");
                };
            });
    });
    it("Registering a Sensor with a port < 0 or > MAX_PORT should return an error.", async () => {
        const wrongSensor = {
            [SENSOR_IP_HEADER]: sensorIp,
            [SENSOR_PORT_HEADER]: -1,
            [API_KEY_HEADER]: SECRET_API_KEY

        };
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(wrongSensor)
            .expect(HttpStatus.NOT_ACCEPTABLE);
        wrongSensor[SENSOR_PORT_HEADER] = MAX_PORT + 1
        await request(app)
            .post(REGISTER_SENSOR_PATH)
            .send(wrongSensor)
            .expect(HttpStatus.NOT_ACCEPTABLE);
    });
    it("Registering a Sensor with a wrong IP should return an error.", async () => {
        const ip: string = "0.0.0.0";
        const wrongSensors = [createSensor("localhost", 10)];
        for (let i = 0; i < 4; i++) {
            const wrongIp = ip.split('.');
            wrongIp[i] = "256";
            wrongSensors.push(createSensor(wrongIp.join('.'), 10));

        }
        for (const sensor of wrongSensors) {
            await request(app)
                .post(REGISTER_SENSOR_PATH)
                .send(sensor)
                .expect(HttpStatus.NOT_ACCEPTABLE);
        }
    });
    afterEach(async () => {
        await shutOffSensor(app, sensorInfomration);
    })
});