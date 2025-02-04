import { ISensor, sensorModel } from '../../../model/v0/sensorModel';

async function exists(ip: string, port: number): Promise<boolean> {
    return (await sensorModel.exists({ ip: ip, port: port })) !== null;
}

async function saveSensor(ip: string, port: number, name: string, type: string, queries: string[]) {
    const newSensor = new sensorModel({ ip, port, name, type, queries });
    newSensor.save();
    return newSensor;
}

async function updateSensorName(ip: string, port: number, newName: string) {
    await sensorModel.updateOne({ ip: ip, port: port }, { $set: { name: newName } });
}

async function findAllSensors(): Promise<Iterable<ISensor>> {
    return (await sensorModel.find({})).map((result) => {
        const sensor: ISensor = {
            ip: result.ip,
            port: result.port,
            name: result.name,
            type: result.type,
            queries: result.queries,
        };
        return sensor;
    });
}

async function deleteSensor(ip: string, port: number): Promise<boolean> {
    const result = await sensorModel.deleteOne({ ip: ip, port: port });
    return result.deletedCount === 1;
}

async function getSensorFromName(name: string): Promise<ISensor | null> {
    return sensorModel.findOne({ name });
}

async function getSensorOfType(type: string): Promise<ISensor[]> {
    return sensorModel.find({ type });
}

export { saveSensor, exists, findAllSensors, deleteSensor, getSensorFromName, getSensorOfType, updateSensorName };
