import { SensorDocument, sensorModel } from "../../model/sensorModel"

async function exists(ip: string, port: number): Promise<boolean> { 
    return await sensorModel.exists( {ip: ip, port: port} ) !== null;
}

async function saveSensor(ip: string, port: number) {
    const newSensor = new sensorModel({ip: ip, port: port});
    newSensor.save();
    return newSensor;
}

export { saveSensor, exists }