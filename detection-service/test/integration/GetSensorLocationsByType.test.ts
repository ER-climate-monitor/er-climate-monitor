import request from 'supertest';
import mongoose from 'mongoose';
import createServer from '../../../detection-service/src/server';
import HttpStatus from 'http-status-codes';
import { beforeAll, afterAll, beforeEach, describe, test, expect } from '@jest/globals';
import { ERROR_TAG } from '../../src/config/Costants';
import { createDetection } from './utils/mockData';
import http from 'http';
// @ts-ignore
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Get Sensor Locations By Type Endpoint', () => {
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

  test('should return 404 if no locations are found for the sensorType', async () => {
    const sensorType = 'temp';
    const res = await request(server).get(`/v0/sensor/${sensorType}/locations`);

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(res.body[ERROR_TAG]).toBe(
      `No locations found for sensor type "${sensorType}".`
    );
  });

  test('should return 200 and locations for a valid sensorType', async () => {
    const sensorType = 'temp';

    const det1 = await createDetection(sensorType, 'sensor-1');
    const det2 = await createDetection(sensorType, 'sensor-2');

    const res = await request(server).get(`/v0/sensor/${sensorType}/locations`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toBeDefined();
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ latitude: det1.latitude, longitude: det1.longitude }),
        expect.objectContaining({ latitude: det2.latitude, longitude: det2.longitude }),
      ])
    );
  });
});