import { SensorDocument, sensorModel } from "../../model/sensorModel"

async function checkSensor(ip: string, port: number): boolean { 
    return await sensorModel.exists( {ip: ip, port: port} ) !== null;
}

async function saveSensor(ip: string, port: number) {
    const newSensor = new sensorModel({ip: ip, port: port});
    newSensor.save();
    return newSensor;
}

export { saveSensor }