import { getLastXDetections, saveDetectionModel } from "./detectionUtils";
import { Detection, DetectionDocument } from "../../../models/v0/detectionModel";
import { Model } from "mongoose";
import { LAST_DETECTION_QUERY_VARIABLE, FROM_TIMESTAMP_QUERY_VALUE, TO_TIMESTAMP_QUERY_VALUE } from "../../../routes/v0/paths/detection.paths";
import { Request } from "express";

function fromBody<X>(body: any, key: string, defaultValue: X) {
    return body && key in body ? body[key] : defaultValue;
}

async function handleSaveDetection(model: Model<DetectionDocument>, data: any) {
    const newDetection = await saveDetectionModel(model,
        fromBody(data, String(process.env.SENSOR_ID_HEADER), ""),
        fromBody(data, String(process.env.SENSOR_NAME_HEADER), ""),
        fromBody(data, String(process.env.SENSOR_DETECTION_UNIT_HEADER), ""),
        fromBody(data, String(process.env.SENSOR_DETECTION_TIMESTAMP_HEADER), 0),
        fromBody(data, String(process.env.SENSOR_DETECTION_LONGITUDE_HEADER), 0),
        fromBody(data, String(process.env.SENSOR_DETECTION_LATITUDE_HEADER), 0),
        fromBody(data, String(process.env.SENSOR_DETECTION_VALUE_HEADER), 0));
    return newDetection;
}

async function handleGetDetectionsFromSensor(model: Model<DetectionDocument>, sensorId: string, request: Request): Promise<Array<Detection>> {
    if (LAST_DETECTION_QUERY_VARIABLE in request.query){
        const days = Number(request.query[LAST_DETECTION_QUERY_VARIABLE]);
        return await getLastXDetections(model, sensorId, days);
    }else if(FROM_TIMESTAMP_QUERY_VALUE in request.query && TO_TIMESTAMP_QUERY_VALUE in request.query){
    }
    throw new Error("");
}

export { handleSaveDetection, handleGetDetectionsFromSensor }