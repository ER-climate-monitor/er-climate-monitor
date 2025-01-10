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
        this.sensorId = this.checkInput(sensorId, "");
        this.sensorName = this.checkInput(sensorName, "");
        this.unit = this.checkInput(unit, "");
        this.timestamp = this.checkInput(timestamp, -1);
        this.longitude = this.checkInput(longitude, -1);
        this.latitude = this.checkInput(latitude, -1);
        this.value = this.checkInput(value, -1);
    }

    private checkInput<X>(input:X, wrongValue: X): X {
        if (input !== wrongValue) {
            return input;
        }
        throw new Error("Illegal argument error, the input value: " + input + " is not correct");
    }
};

export { detectionModel, DetectionDocument, Detection }