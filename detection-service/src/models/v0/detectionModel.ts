import mongoose, { Document, Model } from 'mongoose';

function validateString(input: string) {
    return input.trim().length > 0;
}

interface IDetection {
    sensorId: string;
    sensorName: string;
    unit: string;
    timestamp: number;
    longitude: number;
    latitude: number;
    value: number;
}

interface DetectionDocument extends IDetection, Document { }

const detectionSchema = new mongoose.Schema(
    {
        sensorId: { type: String, required: true, validate: { validator: validateString } },
        sensorName: { type: String, required: true, validate: { validator: validateString } },
        unit: { type: String, required: true, validate: { validator: validateString } },
        timestamp: { type: Number, required: true },
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
        value: { type: Number, required: true },
    },
    { autoIndex: false },
);

class Detection implements IDetection {
    sensorId: string;
    sensorName: string;
    unit: string;
    timestamp: number;
    longitude: number;
    latitude: number;
    value: number;
    constructor(
        sensorId: string,
        sensorName: string,
        unit: string,
        timestamp: number,
        longitude: number,
        latitude: number,
        value: number,
    ) {
        this.sensorId = this.checkInput(sensorId, '');
        this.sensorName = this.checkInput(sensorName, '');
        this.unit = this.checkInput(unit, '');
        this.timestamp = this.checkInput(timestamp, -1);
        this.longitude = this.checkInput(longitude, -1);
        this.latitude = this.checkInput(latitude, -1);
        this.value = this.checkInput(value, -1);
    }

    private checkInput<X>(input: X, wrongValue: X): X {
        if (input !== wrongValue) {
            return input;
        }
        throw new Error(`Illegal argument error, the input value: ${input} is not correct`);
    }
}

function getModelForSensorType(sensorType: string): Model<DetectionDocument> {
    const sensorTypes: { [key: string]: string } = {
        rain: 'Rain',
        idro_level: 'IdroLevel',
        temp: 'Temp',
        wind: 'Wind',
        humidity: 'Humidity',
    };

    if (sensorType.toLowerCase() in sensorTypes) {
        return mongoose.model<DetectionDocument>(sensorTypes[sensorType.toLowerCase()], detectionSchema);
    } else {
        throw new Error(`Unsupported sensor type: ${sensorType}`);
    }
}

export { DetectionDocument, Detection, getModelForSensorType };
