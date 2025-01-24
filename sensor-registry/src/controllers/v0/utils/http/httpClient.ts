import axios from 'axios';
import { SENSOR_CRONJOB_DAYS, SENSOR_CRONJOB_TIME_HOUR, SENSOR_CRONJOB_TIME_MINUTE, SENSOR_NAME } from '../../../../model/v0/headers/sensorHeaders';

interface HttpClient {
    deleteSensor(endpoint: string, ip: string, port: number): Promise<boolean>;
    updateSensorName(endpoint: string, ip: string, port: number, newName: string): Promise<boolean>;
    updateCronJobDays(endpoint: string, ip: string, port: number, newDays: string): Promise<boolean>;
    updateCronJobTime(endpoint: string, ip: string, port: number, hour: string, minute: string): Promise<boolean>;
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

    async updateCronJobDays(endpoint: string, ip: string, port: number, newDays: string): Promise<boolean> {
        const url = this.makeURL(ip, port, endpoint);
        return axios.put(url, {[SENSOR_CRONJOB_DAYS]: newDays});
    }

    async updateCronJobTime(endpoint: string, ip: string, port: number, hour: string, minute: string): Promise<boolean> {
        const url = this.makeURL(ip, port, endpoint);
        return axios.put(url, {[SENSOR_CRONJOB_TIME_HOUR]: hour, [SENSOR_CRONJOB_TIME_MINUTE]: minute});
    }
}

export  { BasicHttpClient }