import request from 'supertest';
import mongoose from 'mongoose';
import createServer from '../../../detection-service/src/server';
import HttpStatus from 'http-status-codes';
import { test, expect, describe, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { generateMockDetection } from './utils/mockData';
import { ERROR_TAG, SUCCESS_TAG } from '../../src/config/Costants';
import { getModelForSensorType } from '../../src/models/v0/detectionModel';
import http from 'http';
// @ts-ignore
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Save Detection Endpoint', () => {
    let server: http.Server;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);

        const app = createServer();
        server = http.createServer(app);
        server.listen();
    });

    beforeEach(async () => {
        const db = mongoose.connection.db!;
        const collections = await db.collections();
        for (const coll of collections) {
            await coll.deleteMany({});
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        server.close();
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
        const badData = { ...generateMockDetection(sensorType), value: undefined };

        const res = await request(server)
            .post(`/v0/sensor/${sensorType}/${sensorId}/detections`)
            .send(badData);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[ERROR_TAG]).toBe('Missing required field: value');
    });
});
