import request from 'supertest';
import mongoose from 'mongoose';
import createServer from '../../../detection-service/src/server';
import HttpStatus from 'http-status-codes';
import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { 
    createDetection, 
    createMultipleDetections
} from './utils/mockData';
import { ERROR_TAG } from '../../src/config/Costants';
import http from 'http';
import { DetectionDocument } from '../../src/models/v0/detectionModel';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Get Detections From Sensor Endpoint', () => {
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
        const collections = await mongoose.connection.db?.collections();
        for (const collection of collections || []) {
            await collection.deleteMany({});
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        server.close();
    });

    test('should return 404 if sensorId does not exist', async () => {
        const res = await request(server)
            .get(`/v0/sensor/temp/nonexistentSensor/detections`);

        expect(res.status).toBe(HttpStatus.NOT_FOUND);
        expect(res.body[ERROR_TAG]).toContain('The input sensor ID does not exist.');
    });

    test('should return 400 if sensorType does not exist', async () => {
        const sensorType = 'invalidType';
        const res = await request(server)
            .get(`/v0/sensor/${sensorType}/123/detections`);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[ERROR_TAG]).toContain(`Unsupported sensor type: ${sensorType}`);
    });

    test('should return all detections for a valid sensor', async () => {
        const sensorType = 'temp';
        const sensorId = 'sensor-1';
    
        const expectedDetections = await createMultipleDetections(sensorType, sensorId, 5);
    
        const res = await request(server)
            .get(`/v0/sensor/${sensorType}/${sensorId}/detections`);
    
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toBeDefined();
        expect(res.body.length).toBe(5);
    
        for (const detection of res.body) {
            const match = expectedDetections.find(
                (expected) =>
                    expected.sensorId === detection.sensorId &&
                    expected.timestamp === detection.timestamp &&
                    expected.value === detection.value &&
                    expected.unit === detection.unit
            );
    
            expect(match).toBeDefined();
        }
    });

    test('should return the last X detections', async () => {
        const sensorType = 'temp';
        const sensorId = 'sensor-2';
    
        const now = Date.now();
        const detection3 = await createDetection(sensorType, sensorId, now - 3000);
        const detection4 = await createDetection(sensorType, sensorId, now - 2000);
        const detection2 = await createDetection(sensorType, sensorId, now - 4000);
        const detection1 = await createDetection(sensorType, sensorId, now - 5000);
        const detection5 = await createDetection(sensorType, sensorId, now - 1000);
    
        const res = await request(server)
            .get(`/v0/sensor/${sensorType}/${sensorId}/detections?last=3`);
    
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toBeDefined();
        expect(res.body.length).toBe(3);
    
        const expectedDetections = [detection5, detection4, detection3];
        res.body.forEach((detection: DetectionDocument, index: number) => {
            expect(detection.sensorId).toBe(expectedDetections[index].sensorId);
            expect(detection.timestamp).toBe(expectedDetections[index].timestamp);
            expect(detection.value).toBe(expectedDetections[index].value);
            expect(detection.unit).toBe(expectedDetections[index].unit);
        });
    });
    
    test('should return detections within a timestamp range', async () => {
        const sensorType = 'temp';
        const sensorId = 'sensor-3';

        const now = Date.now();
        const detection1 = await createDetection(sensorType, sensorId, now - 5 * 24 * 60 * 60 * 1000);
        const detection2 = await createDetection(sensorType, sensorId, now - 3 * 24 * 60 * 60 * 1000);
        const detection3 = await createDetection(sensorType, sensorId, now - 7 * 24 * 60 * 60 * 1000);

        const fromTimestamp = now - 6 * 24 * 60 * 60 * 1000;
        const toTimestamp = now - 2 * 24 * 60 * 60 * 1000;

        const res = await request(server)
            .get(`/v0/sensor/${sensorType}/${sensorId}/detections?from=${fromTimestamp}&to=${toTimestamp}`);

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toBeDefined();
        expect(res.body.length).toBe(2);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ timestamp: detection1.timestamp }),
                expect.objectContaining({ timestamp: detection2.timestamp }),
            ])
        );
    });

    test('should return 400 for invalid query parameters', async () => {
        const sensorType = 'temp';
        const sensorId = 'sensor-4';
        await createDetection(sensorType, sensorId);

        const res = await request(server)
            .get(`/v0/sensor/${sensorType}/${sensorId}/detections?invalidParam=true`);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[ERROR_TAG]).toContain('Invalid query parameters.');
    });
});
