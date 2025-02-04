import mongoose, { Document, Model } from 'mongoose';

interface ISensor {
    ip: string;
    port: number;
    name: string;
    type: string;
    queries: string[];
}

interface SensorDocument extends ISensor, Document {}

const sensorSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    port: { type: Number, required: true, min: 0, max: 65_535 },
    name: { type: String, required: true },
    type: { type: String, required: true },
    queries: { type: Array<string>, required: true },
});

const sensorModel: Model<SensorDocument> = mongoose.model<SensorDocument>('Sensors', sensorSchema);
export { sensorModel, SensorDocument, ISensor };
