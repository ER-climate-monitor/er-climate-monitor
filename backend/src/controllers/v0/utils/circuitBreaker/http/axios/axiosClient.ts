import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';

function axiosCheckServerError(error: AxiosError<unknown, any>): boolean {
    return error.status !== undefined && error.status < 500;
}

class AxiosHttpClient implements HttpClient<AxiosResponse<any, any>> {
    constructor() {}

    public httpGet(endpoint: string, headers: any): Promise<AxiosResponse<any, any>> {
        return axios.get(endpoint, headers);
    }

    public httpPost(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return axios.post(endpoint, body, headers);
    }

    public httpPut(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return axios.put(endpoint, body, headers);
    }

    public httpDelete(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        throw Error('TODO');
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
