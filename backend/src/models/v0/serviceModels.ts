import { config } from 'dotenv';

config();

const AUTHENTICATION_ENDPOINT = 'http://localhost:8888/v0';
const SENSOR_REGISTRY_ENDPOINT = 'http://localhost:7777/v0';
const NOTIFICATION_ENDPOINT = `http://${process.env.NOTIFICATION_SERVICE_HOST ?? 'localhost'}:${process.env.NOTIFICATION_SERVICE_PORT ?? 4444}/v0`;

export { AUTHENTICATION_ENDPOINT, SENSOR_REGISTRY_ENDPOINT, NOTIFICATION_ENDPOINT };
