import express from 'express';
import {
    allSensors,
    registerSensor,
    shutDown,
    allSensorsInfo,
    allSensorsOfType,
    updateSensorInfo,
} from '../../controllers/v0/sensorController';
import { ALL_PATH, REGISTER_PATH, SHUT_DOWN_PATH, TYPE_PATH, ALL_INFO_PATH, UPDATE_SENSOR_PATH } from './paths/sensorPaths';
const sensorRouter = express.Router();

sensorRouter.route(REGISTER_PATH).post(registerSensor);

sensorRouter.route(ALL_PATH).get(allSensors);

sensorRouter.route(SHUT_DOWN_PATH).delete(shutDown);

sensorRouter.route(ALL_INFO_PATH).get(allSensorsInfo);

sensorRouter.route(TYPE_PATH).get(allSensorsOfType);

sensorRouter.route(UPDATE_SENSOR_PATH).put(updateSensorInfo)

export { sensorRouter };
