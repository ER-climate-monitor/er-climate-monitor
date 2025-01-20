import axios, { AxiosError, AxiosResponse } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';

function axiosCheckServerError(error: AxiosError<unknown, any>): boolean {
    return error.status !== undefined && error.status < 500;
}

class AxiosHttpClient implements HttpClient<AxiosResponse<any, any>> {
    constructor() {}

    public httpGet(endpoint: string, headers: any, data: any): Promise<AxiosResponse<any, any>> {
        return axios.get(endpoint, {data});
    }

    public httpPost(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return axios.post(endpoint, body, headers);
    }

    public httpPut(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return axios.put(endpoint, body, headers);
    }

    public httpDelete(endpoint: string, headers: {[key: string]: string}, data: {[key: string]: string | {}}): Promise<AxiosResponse<any, any>> {
        return axios.delete(endpoint, {data});
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
