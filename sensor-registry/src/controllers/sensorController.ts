import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import { isIpValid } from "./utils/ipUtils";
import { exists, findAllSensors, saveSensor } from "./utils/sensorUtils";
import dotenv from 'dotenv';
import { fromBody } from "./utils/requestUtils";

dotenv.config();

const SENSOR_PORT_HEADER = String(process.env.SENSOR_PORT_HEADER);
const SENSOR_IP_HEADER = String(process.env.SENSOR_IP_HEADER);
const API_KEY_HEADER = String(process.env.API_KEY_HEADER);
const API_KEY = String(process.env.API_KEY);
const MAX_PORT = 65_535;



const registerSensor = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        const ip = fromBody(modelData, SENSOR_IP_HEADER, "");
        const port = fromBody(modelData, SENSOR_PORT_HEADER, -1);
        if ((port >= 0 && port <= MAX_PORT) && (ip != "" && isIpValid(ip))) {
            if (!(await exists(ip, port))) {
                await saveSensor(ip, port);
                response.status(HttpStatus.CREATED);
            }else {
                response.status(HttpStatus.NOT_ACCEPTABLE);
            }
        }else{ 
            response.status(HttpStatus.NOT_ACCEPTABLE);
        }
    }else {
        response.status(HttpStatus.BAD_REQUEST);
    }
    response.end();
};

const allSensors = async (request: Request, response: Response) => {
    const modelData = request.body;
        const apikey = fromBody(modelData, API_KEY_HEADER, "");
        if (apikey !== "" && apikey === API_KEY){
            response.send({sensors: await findAllSensors()});
        }
        else{
            response.status(HttpStatus.UNAUTHORIZED);
        }
    response.end();
};

export { registerSensor, allSensors }