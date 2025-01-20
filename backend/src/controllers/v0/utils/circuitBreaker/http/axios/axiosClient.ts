import axios, { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';

function axiosCheckServerError(error: AxiosError<unknown, any>): boolean {
    return error.status !== undefined && error.status < 500;
}

class AxiosHttpClient implements HttpClient<AxiosResponse<any, any>> {
    constructor() {}
    httpGet(endpoint: string, headers: Record<string, string>, data: object, _params: Record<string, string>, queries: Record<string, string>): Promise<AxiosResponse<any, any>> {
        return axios.get(endpoint, {data});
    }
    httpPost(endpoint: string, headers: Record<string, string>, data: object, _params: Record<string, string>, queries: Record<string, string>): Promise<AxiosResponse<any, any>> {
        return axios.post(endpoint, data, headers);
    }

    httpPut(endpoint: string, headers: Record<string, string>, data: object, _params: Record<string, string>, queries: Record<string, string>): Promise<AxiosResponse<any, any>> {
        return axios.put(endpoint, data, headers);
    }

    httpDelete(endpoint: string, headers: Record<string, string>, data: object, _params: Record<string, string>, queries: Record<string, string>): Promise<AxiosResponse<any, any>> {
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
