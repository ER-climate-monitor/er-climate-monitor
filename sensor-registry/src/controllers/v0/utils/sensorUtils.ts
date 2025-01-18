import { ISensor, sensorModel } from '../../../model/v0/sensorModel';

async function exists(ip: string, port: number): Promise<boolean> {
    return (await sensorModel.exists({ ip: ip, port: port })) !== null;
}

async function saveSensor(ip: string, port: number) {
    const newSensor = new sensorModel({ ip: ip, port: port });
    newSensor.save();
    return newSensor;
}

async function findAllSensors(): Promise<Iterable<ISensor>> {
    return (await sensorModel.find({})).map((result) => {
        const sensor = {
            ip: result.ip,
            port: result.port,
        };
        return sensor;
    });
}

async function deleteSensor(ip: string, port: number): Promise<boolean> {
    const result = await sensorModel.deleteOne({ ip: ip, port: port});
    return result.deletedCount === 1;
}

export { saveSensor, exists, findAllSensors, deleteSensor };
