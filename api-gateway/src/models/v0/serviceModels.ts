import { config } from 'dotenv';

config();

const AUTHENTICATION_ENDPOINT = 'https://authentication-service-17633123551.europe-west8.run.app/v0'; //'http://localhost:8888/v0';
const SENSOR_REGISTRY_ENDPOINT = 'https://sensor-registry-17633123551.europe-west8.run.app/v0'; // 'http://localhost:7777/v0';
const DETECTION_ENDPOINT = 'https://detection-service-17633123551.europe-west8.run.app/v0'; // 'http://localhost:8887/v0';
const NOTIFICATION_ENDPOINT = 'https://notification-service-17633123551.europe-west8.run.app/v0'; //`http://${NOTIFICATIONS_API.SERVICE.HOSTNAME}:${NOTIFICATIONS_API.SERVICE.PORT}/v0`;
const DETECTION_SOCKET_ENDPOINT = 'https://detection-service-17633123551.europe-west8.run.app'; // 'http://localhost:8886/';

export {
    AUTHENTICATION_ENDPOINT,
    SENSOR_REGISTRY_ENDPOINT,
    DETECTION_ENDPOINT,
    NOTIFICATION_ENDPOINT,
    DETECTION_SOCKET_ENDPOINT,
};
