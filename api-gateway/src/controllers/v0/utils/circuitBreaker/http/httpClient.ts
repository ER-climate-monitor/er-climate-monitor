import { HttpResponse } from './httpResponse';
import { problematicHeaders } from './problematicHeaders';

interface HttpClient {
    httpGet(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
    httpPost(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
    httpPut(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
    httpDelete(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
}

abstract class AbstractHttpClient<T extends HttpClient> {
    clientTechnology: T;
    protected constructor(clientTechnology: T) {
        this.clientTechnology = clientTechnology;
    }

    private makeRequest(request: () => Promise<HttpResponse>): Promise<HttpResponse> {
        return request();
    }

    protected cleanHeaders(headers: Record<string, string>): Record<string, string> {
        if (!headers) {
            return {};
        }
        problematicHeaders
            .filter((h) => h in headers)
            .forEach((h) => {
                delete headers[h];
            });
        return headers;
    }

    async getRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.makeRequest(() =>
            this.clientTechnology.httpGet(endpoint, this.cleanHeaders(headers), data, params, queries),
        );
    }
    async postRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.makeRequest(() =>
            this.clientTechnology.httpPost(endpoint, this.cleanHeaders(headers), data, params, queries),
        );
    }
    async putRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.makeRequest(() =>
            this.clientTechnology.httpPut(endpoint, this.cleanHeaders(headers), data, params, queries),
        );
    }
    async deleteRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.makeRequest(() =>
            this.clientTechnology.httpDelete(endpoint, this.cleanHeaders(headers), data, params, queries),
        );
    }
}

export { AbstractHttpClient, HttpClient };
