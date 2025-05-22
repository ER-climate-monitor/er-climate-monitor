import request from 'supertest';
import { createTestServer, dropTestDatabase } from '../../../appUtils';
import { describe, it, before, after } from 'mocha';
import HttpStatus from 'http-status-codes';
import { Application } from 'express';
import { HEALTH_API_ROUTE } from './routes/globalRoutes.v0';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app: Application;
let mongodbServer: MongoMemoryServer;

describe('Health status of the server', () => {
    before(async () => {
        mongodbServer = await MongoMemoryServer.create();
        app = createTestServer(mongodbServer.getUri());
    });
    it('Pinging the Health API should return ok.', async () => {
        await request(app).get(HEALTH_API_ROUTE).expect(HttpStatus.OK);
    });
    after(async () => {
        await dropTestDatabase(mongodbServer.getUri());
        await mongodbServer.stop();
    });
});
