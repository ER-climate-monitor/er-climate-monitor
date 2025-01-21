import axios, { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';
import { API_KEY_HEADER } from '../../../../../../models/v0/sensor/headers/sensorHeaders';

function axiosCheckServerError(error: AxiosError<unknown, any>): boolean {
    return error.status !== undefined && error.status < 500;
}

class AxiosHttpClient implements HttpClient<AxiosResponse<any, any>> {
    constructor() {
        axios.defaults.headers.common[API_KEY_HEADER.toLowerCase()] = '';
    }
    private makeAxiosHeaders(headers: Record<string, string>): AxiosHeaders {
        const axiosHeaders = new AxiosHeaders();
        Object.keys(headers).forEach((key) => {
            axiosHeaders[String(key)] = headers[key];
        });
        return axiosHeaders;
    }

    private setSecret(headers: Record<string, string>) {
        const axiosHeaders = this.makeAxiosHeaders(headers);
        if (axiosHeaders.has(API_KEY_HEADER.toLowerCase())) {
            axios.defaults.headers[API_KEY_HEADER.toLowerCase()] = axiosHeaders[API_KEY_HEADER.toLowerCase()];
        }
    }
    httpGet(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<AxiosResponse<any, any>> {
        this.setSecret(headers);
        return axios.get(endpoint);
    }
    httpPost(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<AxiosResponse<any, any>> {
        return axios.post(endpoint, data, headers);
    }

    httpPut(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<AxiosResponse<any, any>> {
        return axios.put(endpoint, data, headers);
    }

    httpDelete(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<AxiosResponse<any, any>> {
        this.setSecret(headers);
        return axios.delete(endpoint, { data });
    }
}

class AxiosService extends AbstractHttpClient<AxiosHttpClient, AxiosResponse> {
    private axiosClient: AxiosHttpClient = new AxiosHttpClient();

    constructor() {
        const axiosC = new AxiosHttpClient();
        super(axiosC);
        this.axiosClient = axiosC;
    }
}

export { AxiosService, axiosCheckServerError };
