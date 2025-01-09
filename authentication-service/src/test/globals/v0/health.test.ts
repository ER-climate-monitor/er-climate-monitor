import request from "supertest"
import createServer from "../../..";
import { describe, it } from "mocha";
import HttpStatus from "http-status-codes";
import { Application } from "express";

const HEALTH_API_ROUTE = "/v0/health/status";
const app: Application = createServer();

describe("Health status of the server", () => {
    it("Pinging the Health API should return ok.", async () => {
        await request(app)
            .get(HEALTH_API_ROUTE)
            .expect(HttpStatus.OK);
    });
});