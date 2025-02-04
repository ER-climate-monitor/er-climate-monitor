import request from 'supertest';
import mongoose from 'mongoose';
import createServer from '../../../detection-service/src/server';
import HttpStatus from 'http-status-codes';
import { beforeAll, afterAll, beforeEach, describe, test, expect, jest } from '@jest/globals';
import { ERROR_TAG } from '../../src/config/Costants';
import { connectToDatabase, closeDatabaseConnection, createDetection } from './utils/mockData';
import http from 'http';
import { DetectionDocument } from '../../src/models/v0/detectionModel';

describe('Get Sensor Locations By Type Endpoint', () => {
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

    test('should return 404 if no locations are found for the sensorType', async () => {
        const sensorType = 'temperature';
        const res = await request(server).get(`/v0/sensor/${sensorType}/locations`);

        expect(res.status).toBe(HttpStatus.NOT_FOUND);
        expect(res.body[ERROR_TAG]).toBe(`No locations found for sensor type "${sensorType}".`);
    });

    test('should return 200 and locations for a valid sensorType', async () => {
        const sensorType = 'temperature';

        const detection1 = await createDetection(sensorType, 'sensor-1');
        const detection2 = await createDetection(sensorType, 'sensor-2');
        const detection3 = await createDetection('hydro', 'sensor-3');

        const expectedDetections = [detection1, detection2];
        const res = await request(server).get(`/v0/sensor/${sensorType}/locations`);

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toBeDefined();
        expect(res.body.length).toBe(2);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ latitude: detection1.latitude, longitude: detection1.longitude }),
                expect.objectContaining({ latitude: detection2.latitude, longitude: detection2.longitude }),
            ])
        );
    });
});
