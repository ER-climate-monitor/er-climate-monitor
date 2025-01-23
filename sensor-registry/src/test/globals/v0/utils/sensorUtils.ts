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
import { SHUT_DOWN_ROUTE } from '../../../../routes/v0/paths/sensorPaths';

dotenv.config();


const SECRET_API_KEY = String(process.env.SECRET_API_KEY);

async function shutDownSensor(app: Application, data: any) {
    await request(app).delete(SHUT_DOWN_ROUTE)
    .set(API_KEY_FIELD, SECRET_API_KEY)
    .query({[SENSOR_IP_FIELD]: data[SENSOR_IP_FIELD]})
    .query({[SENSOR_PORT_FIELD]: data[SENSOR_PORT_FIELD]})
}

function createSensor(ip: string, port: number, name: string, queries: string[]) {
    return {
        [SENSOR_IP_FIELD]: ip,
        [SENSOR_PORT_FIELD]: port,
        [SENSOR_NAME]: name,
        [SENSOR_QUERIES]: queries,
    };
}

export { shutDownSensor, createSensor };
