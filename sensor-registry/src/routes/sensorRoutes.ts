import express from "express"
import { allSensors, registerSensor } from "../controllers/sensorController";

const sensorRouter = express.Router();

sensorRouter.route("/register")
    .post(registerSensor);

sensorRouter.route("/all")
    .get(allSensors)

export { sensorRouter }