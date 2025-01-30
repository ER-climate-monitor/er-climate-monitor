import axios, { AxiosError, AxiosHeaders, AxiosResponse, HttpStatusCode, InternalAxiosRequestConfig } from 'axios';
import { AbstractHttpClient, HttpClient } from '../httpClient';
import { BasicHttpResponse, HttpResponse } from '../httpResponse';
import { HttpRequest } from '../httpRequest';
function axiosCheckServerError(error: AxiosError<unknown, any>): boolean {
    return error.status !== undefined && error.status < 500;
}

/**
 * Axios Implementation for an Http Client.
 */
class AxiosHttpClient implements HttpClient {
    constructor() {}
    
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

    httpGet(endpoint: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return this.sendRequest(() => axios.get(endpoint, { headers: httpRequest.headers }));
    }
    httpPost(endpoint: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return this.sendRequest(() =>
            axios.post(endpoint, httpRequest.body, {
                headers: httpRequest.headers,
            }),
        );
    }

    httpPut(endpoint: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return this.sendRequest(() => axios.put(endpoint, httpRequest.body, { headers: httpRequest.headers }));
    }

    httpDelete(endpoint: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return this.sendRequest(() => axios.delete(endpoint, { headers: httpRequest.headers }));
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
