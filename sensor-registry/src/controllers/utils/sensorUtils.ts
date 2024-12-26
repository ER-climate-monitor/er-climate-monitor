import { ISensor, sensorModel } from "../../model/sensorModel"

async function exists(ip: string, port: number): Promise<boolean> { 
    return await sensorModel.exists( {ip: ip, port: port} ) !== null;
}

async function saveSensor(ip: string, port: number) {
    const newSensor = new sensorModel({ip: ip, port: port});
    newSensor.save();
    return newSensor;
}

async function findAllSensors(): Promise<Iterable<ISensor>> {
    return (await sensorModel.find({}))
        .map(result => {
            const sensor = {
                ip: result.ip,
                port: result.port,
            };
            return sensor;
        });
}

export { saveSensor, exists, findAllSensors }