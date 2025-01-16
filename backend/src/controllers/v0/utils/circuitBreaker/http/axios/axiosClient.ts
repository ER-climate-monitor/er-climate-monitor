import axios, { Axios, AxiosResponse } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';

class AxiosHttpClient implements HttpClient<AxiosResponse<any, any>> {
    axiosClient: Axios;
    constructor() {
        this.axiosClient = new Axios();
    }

    public httpGet(endpoint: string, headers: any): Promise<AxiosResponse<any, any>> {
        return this.axiosClient.get(endpoint, headers);
    }

    public httpPost(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return this.axiosClient.post(endpoint, body, headers);
    }

    public httpPut(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return this.axiosClient.put(endpoint, body, headers);
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

export { AxiosService };
