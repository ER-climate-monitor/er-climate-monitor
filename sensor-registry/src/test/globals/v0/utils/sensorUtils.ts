import request from 'supertest';
import dotenv from 'dotenv';
import { Application } from 'express';
import {
    SENSOR_IP_FIELD,
    SENSOR_PORT_FIELD,
    API_KEY_FIELD,
    SENSOR_NAME,
    SENSOR_QUERIES,
} from '../../../../model/v0/headers/sensorHeaders';
import { SHUT_OFF_ROUTE } from '../../../../routes/v0/paths/sensorPaths';

dotenv.config();

const DELETE_SENSOR_PATH = SHUT_OFF_ROUTE;

const SECRET_API_KEY = String(process.env.SECRET_API_KEY);

async function shutOffSensor(app: Application, data: any) {
    await request(app).delete(DELETE_SENSOR_PATH).send(data);
}

function createSensor(ip: string, port: number, name: string, queries: string[]) {
    return {
        [SENSOR_IP_FIELD]: ip,
        [SENSOR_PORT_FIELD]: port,
        [SENSOR_NAME]: name,
        [SENSOR_QUERIES]: queries,
        [API_KEY_FIELD]: SECRET_API_KEY,
    };
}

export { shutOffSensor, createSensor };
