import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import { saveDetectionModel } from "./utils/detectionUtils";
import { FROM_TIMESTAMP_QUERY_VALUE, LAST_DETECTION_QUERY_VARIABLE, sensorIdParameter, TO_TIMESTAMP_QUERY_VALUE } from "../../routes/v0/paths/detection.paths";


function fromBody<X>(body: any, key: string, defaultValue: X) {
    return body && key in body ? body[key] : defaultValue;
}


const saveDetection = async (request: Request, response: Response) => {
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

const getDetectionsFromSensor = async (request: Request, response: Response) => {
    if (sensorIdParameter in request.params) {
        const sensorId: string = request.params.sensorId;
        if (LAST_DETECTION_QUERY_VARIABLE in request.query){

        }else if(FROM_TIMESTAMP_QUERY_VALUE in request.query && TO_TIMESTAMP_QUERY_VALUE in request.query){
            
        }else{
            response.status(HttpStatus.NOT_ACCEPTABLE)
                .send({
                    [String(process.env.ERROR_TAG)]: "Missing the query variable"
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