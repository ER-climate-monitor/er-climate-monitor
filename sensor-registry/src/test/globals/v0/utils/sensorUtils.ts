import request from 'supertest';
import dotenv from 'dotenv';
import { Application } from 'express';
import { SENSOR_IP_HEADER, SENSOR_PORT_HEADER, API_KEY_HEADER } from '../../../../model/v0/headers/sensorHeaders';
import { SHUT_OFF_ROUTE } from '../../../../routes/v0/paths/sensorPaths';

dotenv.config();

const DELETE_SENSOR_PATH = SHUT_OFF_ROUTE;

const SECRET_API_KEY = String(process.env.SECRET_API_KEY);

async function shutOffSensor(app: Application, data: any) {
    await request(app).delete(DELETE_SENSOR_PATH).send(data);
}

function createSensor(ip: string, port: number) {
    return {
        [SENSOR_IP_HEADER]: ip,
        [SENSOR_PORT_HEADER]: port,
        [API_KEY_HEADER]: SECRET_API_KEY,
    };
}

export { shutOffSensor, createSensor };
