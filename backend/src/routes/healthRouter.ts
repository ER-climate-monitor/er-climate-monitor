import express from "express";
import { health } from "../controllers/healthController";

const healthRouter = express.Router();



healthRouter.route("/status")
    .get(health);

export { healthRouter }