import express from "express";
import { SAVE_DETECTION_PATH } from "./paths/detection.paths";
import { saveDetection } from "../../controllers/v0/detectionController";

const detectionRouter = express.Router();

detectionRouter.route(SAVE_DETECTION_PATH)
    .post(saveDetection);

export { detectionRouter }