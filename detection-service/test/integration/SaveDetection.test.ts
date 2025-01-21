import request from 'supertest';
import mongoose from 'mongoose';
import createServer from '../../../detection-service/src/server'
import HttpStatus from 'http-status-codes';
import { test, expect, describe, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { connectToDatabase, closeDatabaseConnection, generateMockDetection } from './utils/mockData';
import http from 'http';


describe('Save Detection Endpoint', () => {
    const mongoUri = 'mongodb+srv://fabiovincenzi2001:Gszz1ORmQ7QwOigJ@cluster0.qd8ak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
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
            .post('/v0/sensor/temperature/sensor-1/detections')
            .send(); // no data in the request body

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[process.env.ERROR_TAG || 'error']).toContain('Missing detection data in the request body');
    });

    test('should return 201 if detection is successfully saved', async () => {
        const sensorType = 'temperature';
        const sensorId = 'sensor-1';
        const modelData = generateMockDetection(sensorType);

        const res = await request(server)
            .post(`/v0/sensor/${sensorType}/${sensorId}/detections`)
            .send(modelData);

            expect(res.status).toBe(HttpStatus.CREATED);
            expect(res.body[process.env.SUCCESS_TAG || 'success']).toBe('Detection saved successfully.');
    });

    test('should return 400 if saving detection fails', async () => {
        const sensorType = 'temperature';
        const sensorId = 'sensor-1';
        const modelData = { ...generateMockDetection(sensorType), value: undefined };

        const res = await request(server)
            .post(`/v0/sensor/${sensorType}/${sensorId}/detections`)
            .send(modelData);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body[process.env.ERROR_TAG || 'error']).toBe('Missing required field: value');
    });
});
