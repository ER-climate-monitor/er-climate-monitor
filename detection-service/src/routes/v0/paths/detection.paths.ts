const FROM_TIMESTAMP_QUERY_VALUE = 'from';
const TO_TIMESTAMP_QUERY_VALUE = 'to';
const LAST_DETECTION_QUERY_VARIABLE = 'last';
const sensorIdParameter: string = 'sensorId';
const API_ROUTES = {
    SENSOR: {
        ROOT: '/v0/sensor',
        DETECTIONS: `/:sensorType/:${sensorIdParameter}/detections`,
        LOCATIONS: '/:sensorType/locations',
    },
    SERVICE: {
        ALERTS: '/alerts',
    },
};

export {
    API_ROUTES,
    FROM_TIMESTAMP_QUERY_VALUE,
    TO_TIMESTAMP_QUERY_VALUE,
    LAST_DETECTION_QUERY_VARIABLE,
    sensorIdParameter,
};
