import express from "express";
import { health } from "../../controllers/v0/healthController";
import { STATUS_PATH } from "./paths/health.paths";

const healthRouter = express.Router();



healthRouter.route(STATUS_PATH)
    .get(health);

export { healthRouter }