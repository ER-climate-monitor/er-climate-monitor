import mongoose from 'mongoose';
import { DetectionDocument, getModelForSensorType } from '../../../src/models/v0/detectionModel';

function generateMockDetection(sensorType: string, timestamp = Date.now()): Partial<DetectionDocument> {
    return {
        sensorName: `${sensorType}-Sensor`,
        unit: sensorType === 'temperature' ? 'C' : sensorType === 'hydro' ? 'm' : '',
        timestamp,
        longitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
        latitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
        value: parseFloat((Math.random() * 100).toFixed(2)),
    };
}

function generateMultipleMockDetection(sensorType: string, count: number, sensorId: string): Partial<DetectionDocument>[] {
    return Array.from({ length: count }).map((_, index) => generateMockDetection(sensorType));
}
async function createDetection(sensorType: string, sensorId: string, timestamp = Date.now()): Promise<DetectionDocument> {
    const model = getModelForSensorType(sensorType);
    const mockData = generateMockDetection(sensorType, timestamp);

    mockData.sensorId = sensorId;

    const detection = new model(mockData);
    return detection.save();
}


async function createMultipleDetections(sensorType: string, sensorId: string, count: number): Promise<DetectionDocument[]> {
    const model = getModelForSensorType(sensorType);

    const detections = Array.from({ length: count }).map((_, index) => {
        const mockData = generateMockDetection(sensorType);
        mockData.sensorId = sensorId;
        return new model(mockData);
    });

    return model.insertMany(detections);
}

async function connectToDatabase(uri: string): Promise<void> {
    try {
        mongoose.connect(uri, { dbName: 'detections-database-test', autoIndex: false });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

async function closeDatabaseConnection(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
}

export { 
    generateMockDetection, 
    createDetection, 
    createMultipleDetections, 
    connectToDatabase, 
    generateMultipleMockDetection,
    closeDatabaseConnection 
};
