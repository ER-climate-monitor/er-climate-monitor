import {
    SENSOR_ID_HEADER,
    SENSOR_NAME_HEADER,
    SENSOR_DETECTION_VALUE_HEADER,
    SENSOR_DETECTION_LATITUDE_HEADER,
    SENSOR_DETECTION_LONGITUDE_HEADER,
    SENSOR_DETECTION_TIMESTAMP_HEADER,
    SENSOR_DETECTION_UNIT_HEADER
} from '../../../config/Costants'

export default function validateDetectionData(data: Record<string, unknown>): string | null {
    const requiredFields = [
        SENSOR_ID_HEADER,
        SENSOR_NAME_HEADER,
        SENSOR_DETECTION_UNIT_HEADER,
        SENSOR_DETECTION_TIMESTAMP_HEADER,
        SENSOR_DETECTION_VALUE_HEADER,
        SENSOR_DETECTION_LONGITUDE_HEADER,
        SENSOR_DETECTION_LATITUDE_HEADER
    ];

    for (const field of requiredFields) {
        if (!data[field]) {
            return `Missing required field: ${field}`;
        }

        if (
            (field === SENSOR_DETECTION_VALUE_HEADER && typeof data[field] !== 'number') ||
            (field === SENSOR_DETECTION_TIMESTAMP_HEADER && typeof data[field] !== 'number')
        ) {
            return `Invalid value for field: ${field}`;
        }
    }

    return null;
}