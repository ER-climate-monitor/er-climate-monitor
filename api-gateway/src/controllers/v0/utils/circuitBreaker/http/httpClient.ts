import { HttpResponse } from './httpResponse';
import { problematicHeaders } from './problematicHeaders';

/**
 * Interface used for representing a generic Http Client for interacting with all the different services.
 */
interface HttpClient {
    /**
     * Make a generic Http Get.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway GET. 
     * @param {Record<string, string>} _headers - Input headers received from the User's request.
     * @param {Record<string, string>} _params - Path parameters received from the User's request.
     * @param {Record<string, string>} _queries  - Query parameters received from the User's request.
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpGet(
        _endpoint: string,
        _headers: Record<string, string>,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
    /**
     * Make a generic Http Post.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway POST. 
     * @param {Record<string, string>} _headers - Input headers received from the User's request.
     * @param {object} data - Input data to be sent to the endpoint service.
     * @param {Record<string, string>} _params - Path parameters received from the User's request.
     * @param {Record<string, string>} _queries  - Query parameters received from the User's request.
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpPost(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
    /**
     * Make a generic Http Put.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway PUT. 
     * @param {Record<string, string>} _headers - Input headers received from the User's request.
     * @param {object} data - Input data to be sent to the endpoint service.
     * @param {Record<string, string>} _params - Path parameters received from the User's request.
     * @param {Record<string, string>} _queries  - Query parameters received from the User's request.
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpPut(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<HttpResponse>;
    /**
     * Make a generic Http Put.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway PUT. 
     * @param {Record<string, string>} _headers - Input headers received from the User's request.
     * @param {Record<string, string>} _params - Path parameters received from the User's request.
     * @param {Record<string, string>} _queries  - Query parameters received from the User's request.
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpDelete(
        _endpoint: string,
        _headers: Record<string, string>,
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
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.makeRequest(() =>
            this.clientTechnology.httpGet(endpoint, this.cleanHeaders(headers), params, queries),
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
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<HttpResponse> {
        return this.makeRequest(() =>
            this.clientTechnology.httpDelete(endpoint, this.cleanHeaders(headers), params, queries),
        );
    }
}

export { AbstractHttpClient, HttpClient };
