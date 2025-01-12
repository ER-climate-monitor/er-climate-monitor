import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import { checkSensorID, getLastXDetections, saveDetectionModel } from "./utils/detectionUtils";
import { FROM_TIMESTAMP_QUERY_VALUE, LAST_DETECTION_QUERY_VARIABLE, sensorIdParameter, TO_TIMESTAMP_QUERY_VALUE } from "../../routes/v0/paths/detection.paths";
import { Mode } from "fs";
import { DetectionDocument, temperatureDetections } from "../../models/v0/detectionModel";
import { handleGetDetectionsFromSensor, handleSaveDetection } from "./utils/handlers";
import { model } from "mongoose";


function fromBody<X>(body: any, key: string, defaultValue: X) {
    return body && key in body ? body[key] : defaultValue;
}


const saveDetection = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        try{
            const newDetection = await handleSaveDetection(temperatureDetections, modelData);
            response.status(HttpStatus.CREATED);
        }catch(error) {
            response.status(HttpStatus.BAD_REQUEST)
                .send({
                    [String(process.env.ERROR_TAG)]: error
                });
        }
    }
    response.end();
}

const getDetectionsFromSensor = async (request: Request, response: Response) => {
    if (sensorIdParameter in request.params) {
        const sensorId: string = request.params.sensorId;
        try {
            if (await checkSensorID(temperatureDetections, sensorId)) {
                response.status(HttpStatus.OK)
                    .send({
                        [String(process.env.SENSOR_DETECTIONS_HEADER)]: await handleGetDetectionsFromSensor(temperatureDetections, sensorId, request)
                    });
            }else{
                response.status(HttpStatus.NOT_FOUND)
                    .send({
                        [String(process.env.ERROR_TAG)]: "The input sensor ID does not exists"
                    });
            }
        }catch(error) {
            var message = "";
            if (error instanceof Error) {message = error.message;}
            response.status(HttpStatus.BAD_REQUEST)
                .send({
                    [String(process.env.ERROR_TAG)]: message
                });
        }
    }else{
        response.status(HttpStatus.NOT_ACCEPTABLE)
            .send({
                [String(process.env.ERROR_TAG)]: "Missing the sensorId parameter from the input request"
            });
    }
            
    response.end();
}

export { saveDetection, getDetectionsFromSensor }