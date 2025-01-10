import express from "express";
import { DETECTIONS_FROM_SENSOR_PATH, SAVE_DETECTION_PATH } from "./paths/detection.paths";
import { saveDetection, getDetectionsFromSensor } from "../../controllers/v0/detectionController";
import { Detection } from "../../models/v0/detectionModel";

const detectionRouter = express.Router();

detectionRouter.route(SAVE_DETECTION_PATH)
    .post(saveDetection);

detectionRouter.route(DETECTIONS_FROM_SENSOR_PATH)
    .get(getDetectionsFromSensor);

export { detectionRouter }