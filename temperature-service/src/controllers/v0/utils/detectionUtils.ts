import { Detection } from "../../../models/v0/detectionModel";
import { detectionModel, DetectionDocument } from "../../../models/v0/detectionModel";

function createDetection(sensorId: string, sensorName: string, unit: string, timestamp: number, longitude: number, latitude: number, value: number): Detection {
    return new Detection(sensorId, sensorName, unit, timestamp, longitude, latitude, value);
}

async function saveDetectionModel(sensorId: string, sensorName: string, unit: string, timestamp: number, longitude: number, latitude: number, value: number): Promise<DetectionDocument> {
    const detection: Detection = createDetection(sensorId, sensorName, unit, timestamp, longitude, latitude, value);
    const newDetection: DetectionDocument = new detectionModel({
        sensorId: detection.sensorId,
        sensorName: detection.sensorName,
        unit: detection.unit,
        timeStamp: detection.timestamp,
        longitude: detection.longitude,
        latitude: detection.latitude,
        value: detection.value
    });
    await newDetection.save();
    return newDetection
}

async function checkSensorID(sensorId: string): Promise<Boolean> {
    const exists = await detectionModel.exists({sensorId: sensorId});
    return exists !== null;
}

async function getLastXDetections(sensorId: string, last: number): Promise<Array<Detection>> {
    return (await detectionModel.find({sensorId: sensorId})
        .sort({_id: -1})
        .limit(last))
        .map(detection => { 
            return new Detection(detection.sensorId, 
                detection.sensorName, 
                detection.unit, 
                detection.timestamp, 
                detection.longitude,
                detection.latitude,
                detection.value)
            });
}

export { saveDetectionModel, checkSensorID, getLastXDetections }