import { config } from 'dotenv';

config();

const BASE_PATH_V0 = '/v0/api';

const ANY_PARAMETER = '/*';
const AUTHENTICATION_SERVICE = '/authentication';
const AUTHENTICATION_PATHS = AUTHENTICATION_SERVICE + ANY_PARAMETER;
const AUTHENTICATION_COMPLETE_ROUTE = BASE_PATH_V0 + AUTHENTICATION_PATHS;

const notificationServices = {
    HOSTNAME: process.env.NOTIFICATION_SERVICE_HOSTNAME ?? 'notification-service',
    PORT: parseInt(process.env.NOTIFICATION_SERVICE_PORT ?? '4444'),
    PATH: '/alert',
};

const NOTIFICATIONS_API = {
    SERVICE: notificationServices,
    PATHS: {
        SUBSCRIPTION: '/subscriptions',
        RESTORE_SUBSCRIPTIONS: '/subscriptions/restore',
    },
};

const SENSOR_REGISTRY_SERVICE = '/sensor';
const SENSOR_REGISTRY_PATHS = SENSOR_REGISTRY_SERVICE + ANY_PARAMETER;

export {
    BASE_PATH_V0,
    AUTHENTICATION_SERVICE,
    AUTHENTICATION_PATHS,
    AUTHENTICATION_COMPLETE_ROUTE,
    NOTIFICATIONS_API,
    SENSOR_REGISTRY_PATHS,
};
