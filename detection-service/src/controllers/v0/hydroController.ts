import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { handleGetDetectionsFromSensor, handleSaveDetection } from './utils/handlers';
import { hydroLevelDetections } from '../../models/v0/detectionModel';
import { sensorIdParameter } from '../../routes/v0/paths/detection.paths';
import { checkSensorID } from './utils/detectionUtils';

async function saveDetection(req: Request, res: Response) {
    const modelData = req.body;

    if (!modelData) {
        res.end();
        return;
    }

    handleSaveDetection(hydroLevelDetections, modelData)
        .then(() => res.status(HttpStatus.CREATED))
        .catch((e) => res.status(HttpStatus.BAD_REQUEST).send({ [String(process.env.ERROR_TAG)]: e }))
        .finally(() => res.end());
}

async function getDetectionFromSensor(req: Request, res: Response) {
    if (sensorIdParameter! in req.params) {
        res.status(HttpStatus.NOT_ACCEPTABLE).send({
            [String(process.env.ERROR_TAG)]: `Missing "sensorId" parameter from the input request`,
        });
    }

    const sensorId = req.params.sensorId;

    try {
        if (!(await checkSensorID(hydroLevelDetections, sensorId))) {
            res.status(HttpStatus.NOT_FOUND);
            res.send({ [String(process.env.ERROR_TAG)]: 'The input sensor ID does not exists' });
        }

        const result = await handleGetDetectionsFromSensor(hydroLevelDetections, sensorId, req);
        res.status(HttpStatus.OK);
        res.send({ [String(process.env.SENSOR_DETECTIONS_HEADER)]: result });
    } catch (error) {
        let msg = 'An error occurred...';
        if (error instanceof Error) {
            msg = error.message;
        }

        res.status(HttpStatus.BAD_REQUEST);
        res.send({ [String(process.env.ERROR_TAG)]: msg });
    }

    res.send();
}

export { saveDetection, getDetectionFromSensor };
