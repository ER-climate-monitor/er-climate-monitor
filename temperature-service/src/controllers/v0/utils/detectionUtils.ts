import { Detection } from "../../../models/v0/detectionModel";
import { detectionModel, DetectionDocument } from "../../../models/v0/detectionModel";

function createDetection(sensorId: string, sensorName: string, unit: string, timestamp: number, longitude: number, latitude: number, value: number): Detection {
    return new Detection(sensorId, sensorName, unit, timestamp, longitude, latitude, value);
}

async function saveDetectionModel(sensorId: string, sensorName: string, unit: string, timestamp: number, longitude: number, latitude: number, value: number): Promise<DetectionDocument> {
    const detection: Detection = createDetection(sensorId, sensorName, unit, timestamp, longitude, latitude, value);
    const newDetection: DetectionDocument = new detectionModel(detectionModel);
    await newDetection.save();
    return newDetection
}