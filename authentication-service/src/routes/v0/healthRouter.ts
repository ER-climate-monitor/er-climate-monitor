import express from "express";
import { health } from "../../controllers/v0/healthController";

const healthRouter = express.Router();



healthRouter.route("/status")
    .get(health);

export { healthRouter }