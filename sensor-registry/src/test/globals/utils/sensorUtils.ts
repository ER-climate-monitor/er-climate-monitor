import { describe } from "mocha"
import request from "supertest";
import dotenv from 'dotenv';
import HttpStatus from "http-status-codes";
import { Application } from "express";

dotenv.config();

const DELETE_SENSOR_PATH = "/sensor/shutoff";

const SENSOR_PORT_HEADER = String(process.env.SENSOR_PORT_HEADER);
const SENSOR_IP_HEADER = String(process.env.SENSOR_IP_HEADER);
const API_KEY_HEADER = String(process.env.API_KEY_HEADER);


async function shutOffSensor(app: Application, data: any) {
    await request(app)
        .delete(DELETE_SENSOR_PATH)
        .send(data)
}

export { shutOffSensor }
