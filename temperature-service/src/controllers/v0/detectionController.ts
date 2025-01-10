import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import dotenv from "dotenv";
import { saveDetectionModel } from "./utils/detectionUtils";

function fromBody<X>(body: any, key: string, defaultValue: X) {
    return body && key in body ? body[key] : defaultValue;
}


const saveDetection = async (request: Request, response: Response) {
    const modelData = request.body;
    if (modelData) {
        try{
            const newDetection = await saveDetectionModel(
                fromBody(modelData, String(process.env.SENSOR_ID_HEADER), ""),
                fromBody(modelData, String(process.env.SENSOR_NAME_HEADER), ""),
                fromBody(modelData, String(process.env.SENSOR_DETECTION_UNIT_HEADER), ""),
                fromBody(modelData, String(process.env.SENSOR_DETECTION_TIMESTAMP_HEADER), 0),
                fromBody(modelData, String(process.env.SENSOR_DETECTION_LONGITUDE_HEADER), 0),
                fromBody(modelData, String(process.env.SENSOR_DETECTION_LATITUDE_HEADER), 0),
                fromBody(modelData, String(process.env.SENSOR_DETECTION_VALUE), 0));
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