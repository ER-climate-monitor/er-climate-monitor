import { Model } from 'mongoose';
import { Detection } from '../../../models/v0/detectionModel';
import { DetectionDocument } from '../../../models/v0/detectionModel';

const LOWER_BOUND = 0;
const UPPER_BOUND = 100;

function createDetection(
    sensorId: string,
    sensorName: string,
    unit: string,
    timestamp: number,
    longitude: number,
    latitude: number,
    value: number,
): Detection {
    return new Detection(sensorId, sensorName, unit, timestamp, longitude, latitude, value);
}

async function saveDetection(model: Model<DetectionDocument>, detection: Detection): Promise<DetectionDocument> {
    const newDetection: DetectionDocument = new model({
        sensorId: detection.sensorId,
        sensorName: detection.sensorName,
        unit: detection.unit,
        timestamp: detection.timestamp,
        longitude: detection.longitude,
        latitude: detection.latitude,
        value: detection.value,
    });
    await newDetection.save();
    return newDetection;
}

async function saveDetectionModel(
    model: Model<DetectionDocument>,
    sensorId: string,
    sensorName: string,
    unit: string,
    timestamp: number,
    longitude: number,
    latitude: number,
    value: number,
): Promise<DetectionDocument> {
    const detection: Detection = createDetection(sensorId, sensorName, unit, timestamp, longitude, latitude, value);
    return saveDetection(model, detection);
}

async function checkSensorID(model: Model<DetectionDocument>, sensorId: string): Promise<boolean> {
    const exists = await model.exists({ sensorId: sensorId });
    return exists !== null;
}

async function getLastXDetections(
    model: Model<DetectionDocument>,
    sensorId: string,
    last: number,
): Promise<Array<Detection>> {
    if (last <= LOWER_BOUND || last > UPPER_BOUND) {
        throw new Error(`The query prameter last, must be in the interval: [${LOWER_BOUND}, ${UPPER_BOUND}]`);
    }
    return (await model.find({ sensorId: sensorId }).sort({ timestamp: -1 }).limit(last)).map((detection) => {
        return new Detection(
            detection.sensorId,
            detection.sensorName,
            detection.unit,
            detection.timestamp,
            detection.longitude,
            detection.latitude,
            detection.value,
        );
    });
}

export { saveDetectionModel, checkSensorID, getLastXDetections, createDetection };
