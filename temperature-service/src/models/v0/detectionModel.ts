import mongoose, { Document, Model } from "mongoose"

interface IDetection {
    sensorId: string,
    sensorName: string,
    unit: string,
    timestamp: number,
    longitude: number,
    latitude: number,
    value: number
}

interface DetectionDocument extends IDetection, Document {};

const detectionSchema = new mongoose.Schema({
    sensorId: {type: String, required: true, unique: true},
    sensorName: {type: String, required: true},
    unit: {type: String, required: true},
    timeStamp: {type: Number, required: true},
    longitude: {type: Number, required: true},
    latitude: {type: Number, required: true},
    value: {type: Number, required: true}
});

const detectionModel: Model<DetectionDocument> = mongoose.model<DetectionDocument>("Detections", detectionSchema);

class Detection implements IDetection {
    sensorId: string;
    sensorName: string;
    unit: string;
    timestamp: number;
    longitude: number;
    latitude: number;
    value: number;
    constructor(sensorId: string, sensorName: string, unit: string, timestamp: number, longitude: number, latitude: number, value: number) {
        this.sensorId = sensorId;
        this.sensorName = sensorName;
        this.unit = unit;
        this.timestamp = timestamp;
        this.longitude = longitude;
        this.latitude = latitude;
        this.value = value;
    }
};

export { detectionModel, DetectionDocument, Detection }