import express from "express"
import { allSensors, registerSensor, shutOff } from "../controllers/sensorController";

const sensorRouter = express.Router();

sensorRouter.route("/register")
    .post(registerSensor);

sensorRouter.route("/all")
    .get(allSensors)

sensorRouter.route("/shutoff")
    .delete(shutOff);

export { sensorRouter }