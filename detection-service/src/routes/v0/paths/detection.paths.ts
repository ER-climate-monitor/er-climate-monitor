const FROM_TIMESTAMP_QUERY_VALUE = 'from';
const TO_TIMESTAMP_QUERY_VALUE = 'to';
const LAST_DETECTION_QUERY_VARIABLE = 'last';
const sensorIdParameter: string = 'sensorId';
const API_ROUTES = {
    SENSOR: {
        ROOT: '/v0/sensor',
        DETECTIONS: `/:sensorType/:${sensorIdParameter}/detections`,
        POSITIONS: '/:sensorType/positions',
    },
    SERVICE: {
      ALERTS: '/v0/service/alerts',
    },
  };
  
  export  {
    API_ROUTES,
    FROM_TIMESTAMP_QUERY_VALUE,
    TO_TIMESTAMP_QUERY_VALUE,
    LAST_DETECTION_QUERY_VARIABLE,
    sensorIdParameter,
  };
  

