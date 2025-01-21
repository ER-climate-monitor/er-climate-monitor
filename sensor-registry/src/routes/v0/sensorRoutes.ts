import express from 'express';
import {
    allSensors,
    registerSensor,
    shutOff,
    allQueriesForSensor,
    allSensorsOfType,
} from '../../controllers/v0/sensorController';
import { ALL_PATH, QUERIES_PATH, REGISTER_PATH, SHUT_OFF_PATH, TYPE_PATH } from './paths/sensorPaths';
const sensorRouter = express.Router();

sensorRouter.route(REGISTER_PATH).post(registerSensor);

sensorRouter.route(ALL_PATH).get(allSensors);

sensorRouter.route(SHUT_OFF_PATH).delete(shutOff);

sensorRouter.route(QUERIES_PATH).get(allQueriesForSensor);

sensorRouter.route(TYPE_PATH).get(allSensorsOfType);

export { sensorRouter };
