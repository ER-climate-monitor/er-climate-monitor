export default function validateDetectionData(data: Record<string, unknown>): string | null {
    const requiredFields = [
        String(process.env.SENSOR_ID_HEADER),
        String(process.env.SENSOR_NAME_HEADER),
        String(process.env.SENSOR_DETECTION_UNIT_HEADER),
        String(process.env.SENSOR_DETECTION_TIMESTAMP_HEADER),
        String(process.env.SENSOR_DETECTION_VALUE_HEADER),
        String(process.env.SENSOR_DETECTION_LONGITUDE_HEADER),
        String(process.env.SENSOR_DETECTION_LATITUDE_HEADER),
    ];

    for (const field of requiredFields) {
        if (!data[field]) {
            return `Missing required field: ${field}`;
        }

        if (
            (field === String(process.env.SENSOR_DETECTION_VALUE_HEADER) && typeof data[field] !== 'number') ||
            (field === String(process.env.SENSOR_DETECTION_TIMESTAMP_HEADER) && typeof data[field] !== 'number')
        ) {
            return `Invalid value for field: ${field}`;
        }
    }

    return null;
}