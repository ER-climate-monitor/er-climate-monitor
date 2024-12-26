import mongoose, { Document, Model } from "mongoose";

interface ISensor {
    ip: string
    port: number
}

interface SensorDocument extends ISensor, Document {}

const sensorSchema = new mongoose.Schema({
    ip: {type: String, required: true},
    port: {type: Number, required: true, min: 0, max: 65_535 }
});

const sensorModel: Model<SensorDocument> = mongoose.model<SensorDocument>("Sensors", sensorSchema);
export { sensorModel, SensorDocument }