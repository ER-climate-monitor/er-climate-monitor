import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { getModelForSensorType } from '../../models/v0/detectionModel';
import { handleGetDetectionsFromSensor, handleSaveDetection, handleGetSensorLocationsByType } from './utils/handlers';
import { sensorIdParameter } from '../../routes/v0/paths/detection.paths';
import { checkSensorID } from './utils/detectionUtils';

async function saveDetection(req: Request, res: Response) {
    const modelData = req.body;
    const { sensorType, [sensorIdParameter]: sensorId } = req.params;

    if (!modelData) {
        res.status(HttpStatus.BAD_REQUEST).send({
            [String(process.env.ERROR_TAG)]: 'Missing detection data in the request body.',
        });
        return;
    }

    handleSaveDetection(getModelForSensorType(sensorType), modelData)
        .then(() => res.status(HttpStatus.CREATED).send({
            [String(process.env.SUCCESS_TAG)]: 'Detection saved successfully.',
        }))
        .catch((e) => res.status(HttpStatus.BAD_REQUEST).send({
            [String(process.env.ERROR_TAG)]: e.message || 'Failed to save detection.',
        }))
        .finally(() => res.end());
}

async function getDetectionsFromSensor(req: Request, res: Response) {
    const { sensorType, [sensorIdParameter]: sensorId } = req.params;

    if (!sensorType) {
        res.status(HttpStatus.NOT_ACCEPTABLE).send({
            [String(process.env.ERROR_TAG)]: `Missing "sensorType" parameter from the input request.`,
        });
        return;
    }

    if (!sensorId) {
        res.status(HttpStatus.NOT_ACCEPTABLE).send({
            [String(process.env.ERROR_TAG)]: `Missing "sensorId" parameter from the input request.`,
        });
        return;
    }

    try {
        if (!(await checkSensorID(getModelForSensorType(sensorType), sensorId))) {
            res.status(HttpStatus.NOT_FOUND).send({
                [String(process.env.ERROR_TAG)]: 'The input sensor ID does not exist.',
            });
            return;
        }

        const result = await handleGetDetectionsFromSensor(sensorType, sensorId, req);
        res.status(HttpStatus.OK).send({
            [String(process.env.SENSOR_DETECTIONS_HEADER)]: result,
        });
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).send({
            [String(process.env.ERROR_TAG)]: error instanceof Error ? error.message : 'An error occurred.',
        });
    } finally {
        res.end();
    }
}

async function getSensorLocationsByType(req: Request, res: Response) {
    const { sensorType } = req.params;

    if (!sensorType) {
        res.status(HttpStatus.BAD_REQUEST).send({
            [String(process.env.ERROR_TAG)]: 'Missing "sensorType" parameter from the input request.',
        });
        return;
    }

    try {
        const result = await handleGetSensorLocationsByType(getModelForSensorType(sensorType));
        if (!result || result.length === 0) {
            res.status(HttpStatus.NOT_FOUND).send({
                [String(process.env.ERROR_TAG)]: `No locations found for sensor type "${sensorType}".`,
            });
            return;
        }

        res.status(HttpStatus.OK).send({
            [String(process.env.SENSOR_LOCATIONS_HEADER)]: result,
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            [String(process.env.ERROR_TAG)]: error instanceof Error ? error.message : 'An error occurred.',
        });
    } finally {
        res.end();
    }
}

export { saveDetection, getDetectionsFromSensor, getSensorLocationsByType };
