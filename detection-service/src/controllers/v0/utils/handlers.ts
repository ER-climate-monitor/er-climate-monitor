import { getLastXDetections, saveDetectionModel } from './detectionUtils';
import { Detection, DetectionDocument, getModelForSensorType } from '../../../models/v0/detectionModel';
import { Model } from 'mongoose';
import {
    LAST_DETECTION_QUERY_VARIABLE,
    FROM_TIMESTAMP_QUERY_VALUE,
    TO_TIMESTAMP_QUERY_VALUE,
} from '../../../routes/v0/paths/detection.paths';
import {
    SENSOR_ID_HEADER,
    SENSOR_NAME_HEADER,
    SENSOR_DETECTION_VALUE_HEADER,
    SENSOR_DETECTION_LATITUDE_HEADER,
    SENSOR_DETECTION_LONGITUDE_HEADER,
    SENSOR_DETECTION_TIMESTAMP_HEADER,
    SENSOR_DETECTION_UNIT_HEADER,
} from '../../../config/Costants';
import { Request } from 'express';
import { Alert, buildEvent } from 'src/models/v0/alertModel';
import { detectionPublisher } from './brokerClient';

function fromBody<X>(body: any, key: string, defaultValue: X) {
    return body && key in body ? body[key] : defaultValue;
}

async function handleSaveDetection(model: Model<DetectionDocument>, data: any) {
    const newDetection = await saveDetectionModel(
        model,
        fromBody(data, SENSOR_ID_HEADER, ''),
        fromBody(data, SENSOR_NAME_HEADER, ''),
        fromBody(data, SENSOR_DETECTION_UNIT_HEADER, ''),
        fromBody(data, SENSOR_DETECTION_TIMESTAMP_HEADER, 0),
        fromBody(data, SENSOR_DETECTION_LONGITUDE_HEADER, 0),
        fromBody(data, SENSOR_DETECTION_LATITUDE_HEADER, 0),
        fromBody(data, SENSOR_DETECTION_VALUE_HEADER, 0),
    );
    return newDetection;
}

async function handleGetDetectionsFromSensor(
    sensorType: string,
    sensorId: string,
    request: Request,
): Promise<Array<Detection>> {
    const model = getModelForSensorType(sensorType);

    if (LAST_DETECTION_QUERY_VARIABLE in request.query) {
        const last = Number(request.query[LAST_DETECTION_QUERY_VARIABLE]);
        return await getLastXDetections(model, sensorId, last);
    } else if (FROM_TIMESTAMP_QUERY_VALUE in request.query && TO_TIMESTAMP_QUERY_VALUE in request.query) {
        const fromTimestamp = Number(request.query[FROM_TIMESTAMP_QUERY_VALUE]);
        const toTimestamp = Number(request.query[TO_TIMESTAMP_QUERY_VALUE]);

        const detections = await model
            .find({
                sensorId: sensorId,
                timestamp: { $gte: fromTimestamp, $lte: toTimestamp },
            })
            .sort({ timestamp: -1 });
        return detections.map(
            (detection) =>
                new Detection(
                    detection.sensorId,
                    detection.sensorName,
                    detection.unit,
                    detection.timestamp,
                    detection.longitude,
                    detection.latitude,
                    detection.value,
                ),
        );
    } else if (Object.keys(request.query).length === 0) {
        const detections = await model.find({ sensorId }).sort({ timestamp: -1 });

        return detections.map(
            (detection) =>
                new Detection(
                    detection.sensorId,
                    detection.sensorName,
                    detection.unit,
                    detection.timestamp,
                    detection.longitude,
                    detection.latitude,
                    detection.value,
                ),
        );
    }
    throw new Error('Invalid query parameters.');
}

async function handleGetSensorLocationsByType(model: Model<DetectionDocument>) {
    try {
        const locations = await model.aggregate([
            {
                $group: {
                    _id: '$sensorId',
                    longitude: { $first: '$longitude' },
                    latitude: { $first: '$latitude' },
                },
            },
        ]);
        return locations;
    } catch (error) {
        throw new Error(`Failed to retrieve sensor locations: ${error}`);
    }
}

async function handleAlertPropagation(alert: Alert): Promise<boolean> {
    return detectionPublisher.publishEvent(buildEvent(alert));
}

export { handleSaveDetection, handleGetDetectionsFromSensor, handleGetSensorLocationsByType, handleAlertPropagation };
