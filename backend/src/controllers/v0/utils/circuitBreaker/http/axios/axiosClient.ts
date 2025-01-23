import axios, { AxiosError, AxiosHeaders, AxiosResponse, HttpStatusCode } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';
import { API_KEY_HEADER } from '../../../../../../models/v0/sensor/headers/sensorHeaders';
import { USER_TOKEN_HEADER } from '../../../../../../models/v0/authentication/headers/authenticationHeaders';
import { BasicHttpResponse, HttpResponse } from '../httpResponse';
function axiosCheckServerError(error: AxiosError<unknown, any>): boolean {
    return error.status !== undefined && error.status < 500;
}

class AxiosHttpClient implements HttpClient {
    constructor() {
    }

    private fromAxiosHeadersToRecord(axiosHeaders: any): Record<string, string> {
        const headers: Record<string, string> = {};
        Object.keys(axiosHeaders).forEach((key) => (headers[key] = axiosHeaders[key]));
        return headers;
    }

    private async sendRequest(request: () => Promise<AxiosResponse>): Promise<HttpResponse> {
        try {
            const response = await request();
            return new BasicHttpResponse(
                response.status,
                this.fromAxiosHeadersToRecord(response.headers),
                response.data,
            );
        } catch (error) {
            if (error instanceof AxiosError && error.response !== undefined) {
                return new BasicHttpResponse(
                    error.response.status,
                    this.fromAxiosHeadersToRecord(error.response.headers),
                    error.response.data,
                );
            } else if (error instanceof Error) {
                return new BasicHttpResponse(HttpStatusCode.BadRequest, {}, Object(error.message));
            }
            return new BasicHttpResponse(HttpStatusCode.BadRequest);
        } finally {
        }
    }

    httpGet(
        endpoint: string,
        headers: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.sendRequest(() => axios.get(endpoint));
    }
    httpPost(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
    ): Promise<HttpResponse> {
        return this.sendRequest(() => axios.post(endpoint, data, headers));
    }

    httpPut(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
    ): Promise<HttpResponse> {
        return this.sendRequest(() => axios.put(endpoint, data, {headers}));
    }

    httpDelete(
        endpoint: string,
        headers: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.sendRequest(() => axios.delete(endpoint, {headers}));
    }
}

class AxiosService extends AbstractHttpClient<AxiosHttpClient> {
    private axiosClient: AxiosHttpClient = new AxiosHttpClient();

    constructor() {
        const axiosC = new AxiosHttpClient();
        super(axiosC);
        this.axiosClient = axiosC;
    }
}

export { AxiosService, axiosCheckServerError };
