import request from 'supertest';
import mongoose from 'mongoose';
import createServer from '../../../detection-service/src/server'
import HttpStatus from 'http-status-codes';
import { test, expect, describe, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { connectToDatabase, closeDatabaseConnection, generateMockDetection } from './utils/mockData';
import http from 'http';
import { ERROR_TAG, SUCCESS_TAG } from '../../src/config/Costants';
import { DetectionDocument, getModelForSensorType } from '../../src/models/v0/detectionModel';


describe('Save Detection Endpoint', () => {
    const mongoUri = 'mongodb://localhost:27017';
    let server: http.Server;

    beforeAll(async () => {
        const app = createServer();
        server = http.createServer(app);
        server.listen();
        await connectToDatabase(mongoUri);
    });

    beforeEach(async () => {
        const collections = await mongoose.connection.db?.collections();
        for (let collection of collections || []) {
            await collection.deleteMany({});
        }
    });

    afterAll(async () => {
        server.close();
        await mongoose.connection.db?.dropDatabase();
        await closeDatabaseConnection();
    });

    test('should return 400 if modelData is missing', async () => {
        const res = await request(server)
            .post('/v0/sensor/temp/sensor-1/detections')
            .send();

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[ERROR_TAG]).toContain('Missing detection data in the request body');
    });

    test('should return 201 if detection is successfully saved and check in DB', async () => {
        const sensorType = 'temp';
        const sensorId = 'sensor-1';

        const modelData = generateMockDetection(sensorType);

        const res = await request(server)
            .post(`/v0/sensor/${sensorType}/${sensorId}/detections`)
            .send(modelData);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(res.body[SUCCESS_TAG]).toBe('Detection saved successfully.');

        const DetectionModel = getModelForSensorType(sensorType);
        const savedDetection = await DetectionModel.findOne({ sensorId });

        expect(savedDetection).toBeTruthy();
        expect(savedDetection?.sensorName).toBe(modelData.sensorName);
        expect(savedDetection?.unit).toBe(modelData.unit);
        expect(savedDetection?.timestamp).toBe(modelData.timestamp);
        expect(savedDetection?.longitude).toBe(modelData.longitude);
        expect(savedDetection?.latitude).toBe(modelData.latitude);
        expect(savedDetection?.value).toBe(modelData.value);
    });

    test('should return 400 if saving detection fails', async () => {
        const sensorType = 'temp';
        const sensorId = 'sensor-1';
        const modelData = { ...generateMockDetection(sensorType), value: undefined };

        const res = await request(server)
            .post(`/v0/sensor/${sensorType}/${sensorId}/detections`)
            .send(modelData);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[ERROR_TAG]).toBe('Missing required field: value');
    });
});
