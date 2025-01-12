import express from "express";
import { DETECTIONS_FROM_SENSOR_PATH, SAVE_DETECTION_PATH } from "./paths/detection.paths";
import { saveDetection, getDetectionsFromSensor } from "../../controllers/v0/temperatureController";
import { Detection } from "../../models/v0/detectionModel";

const temperatureRouter = express.Router();

temperatureRouter.route(SAVE_DETECTION_PATH)
    .post(saveDetection);

    temperatureRouter.route(DETECTIONS_FROM_SENSOR_PATH)
    .get(getDetectionsFromSensor);

export { temperatureRouter }