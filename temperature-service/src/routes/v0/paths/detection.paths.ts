const sensorIdParameter: string = "sensorId";
const LAST_DETECTION_QUERY_VARIABLE = "last";
const FROM_TIMESTAMP_QUERY_VALUE = "from";
const TO_TIMESTAMP_QUERY_VALUE = "to";
const SAVE_DETECTION_PATH = "/detection";
const DETECTIONS_FROM_SENSOR_PATH = "/{" + sensorIdParameter + "}/detections";


export { sensorIdParameter, LAST_DETECTION_QUERY_VARIABLE, 
    FROM_TIMESTAMP_QUERY_VALUE, TO_TIMESTAMP_QUERY_VALUE, 
    SAVE_DETECTION_PATH, DETECTIONS_FROM_SENSOR_PATH }