import { config } from 'dotenv';
import { NOTIFICATIONS_API } from '../../routes/v0/paths/gatewayPaths';

config();

const AUTHENTICATION_ENDPOINT = 'http://localhost:8888/v0';
const SENSOR_REGISTRY_ENDPOINT = 'http://localhost:7777/v0';
const DETECTION_ENDPOINT = 'http://localhost:8887/v0';
const NOTIFICATION_ENDPOINT = `http://${NOTIFICATIONS_API.SERVICE.HOSTNAME}:${NOTIFICATIONS_API.SERVICE.PORT}/v0`;

export { AUTHENTICATION_ENDPOINT, SENSOR_REGISTRY_ENDPOINT, DETECTION_ENDPOINT, NOTIFICATION_ENDPOINT };
