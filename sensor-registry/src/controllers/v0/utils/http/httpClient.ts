import axios, { HttpStatusCode } from 'axios';
import { SHUT_DOWN_PATH } from "../../../../routes/v0/paths/sensorPaths";
import { SENSOR_NAME } from '../../../../model/v0/headers/sensorHeaders';

interface HttpClient {
    deleteSensor(endpoint: string, ip: string, port: number): Promise<boolean>;
    updateSensorName(endpoint: string, ip: string, port: number, newName: string): Promise<boolean>;
}

class BasicHttpClient implements HttpClient{
    constructor() {}

    private makeURL(ip: string, port: number, endpoint: string) {
        return `http://${ip}:${port}${endpoint}`;
    }

    async deleteSensor(endpoint: string, ip: string, port: number): Promise<boolean> {
        const url = this.makeURL(ip, port, endpoint);
        return axios.delete(url);
    }

    async updateSensorName(endpoint: string, ip: string, port: number, newName: string): Promise<boolean> {
        const url = this.makeURL(ip, port, endpoint);
        return axios.put(url, {[SENSOR_NAME]: newName});
    }
}

export  { BasicHttpClient }