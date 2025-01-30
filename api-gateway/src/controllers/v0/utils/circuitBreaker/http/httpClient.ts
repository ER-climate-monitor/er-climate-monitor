import { HttpRequest } from './httpRequest';
import { HttpResponse } from './httpResponse';
import { problematicHeaders } from './problematicHeaders';

/**
 * Interface used for representing a generic Http Client for interacting with all the different services.
 */
interface HttpClient {
    /**
     * Make a generic Http Get.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway GET. 
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpGet(
        endpoint: string,
        request: HttpRequest,
    ): Promise<HttpResponse>;
    /**
     * Make a generic Http Post.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway POST. 
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpPost(
        _endpoint: string,
        httpRequest: HttpRequest,
    ): Promise<HttpResponse>;
    /**
     * Make a generic Http Put.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway PUT. 
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpPut(
        _endpoint: string,
        httpRequest: HttpRequest,
    ): Promise<HttpResponse>;
    /**
     * Make a generic Http Put.
     * @param {string} _endpoint - Service endpoint that will receive the API Gateway PUT. 
     * @returns {HttpResponse} The endpoint's http response.
     */
    httpDelete(
        _endpoint: string,
        httpRequest: HttpRequest,
    ): Promise<HttpResponse>;
}

/**
 * Abstract Http Client, this class will be extended by all the different technologies used for making different http requests to all the other
 * services.
 * @template {T extends HttpClient} - The type of the client that will be used for making all the http requests.
 */
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
    /**
     * Make an async Get request to the input endpoint using the internal client technology.
     * @param {string} endpoint - Endpoint service that will receive the client request.
     * @returns {Promise<HttpResponse>} Return the service's http response.
     */
    async getRequest(
        endpoint: string,
        httpRequest: HttpRequest,
    ): Promise<HttpResponse> {
        httpRequest.headers = this.cleanHeaders(httpRequest.headers);
        return this.makeRequest(() =>
            this.clientTechnology.httpGet(endpoint, httpRequest),
        );
    }
    /**
     * Make an async Post request to the input endpoint using the internal client technology.
     * @param {string} endpoint - Endpoint service that will receive the client request
     * @returns {Promise<HttpResponse>} Return the service's http response.
     */
    async postRequest(
        endpoint: string,
        httpRequest: HttpRequest
    ): Promise<HttpResponse> {
        httpRequest.headers = this.cleanHeaders(httpRequest.headers);
        return this.makeRequest(() =>
            this.clientTechnology.httpPost(endpoint, httpRequest),
        );
    }
    /**
     * Make an async Put request to the input endpoint using the internal client technology.
     * @param {string} endpoint - Endpoint service that will receive the client request.
     * @returns {Promise<HttpResponse>} Return the service's http response.
     */
    async putRequest(
        endpoint: string,
        httpRequest: HttpRequest,
    ): Promise<HttpResponse> {
        httpRequest.headers = this.cleanHeaders(httpRequest.headers); 
        return this.makeRequest(() =>
            this.clientTechnology.httpPut(endpoint, httpRequest),
        );
    }
    /**
     * Make an async Delete request to the input endpoint using the internal client technology.
     * @param {string} endpoint - Endpoint service that will receive the client request.
     * @returns {Promise<HttpResponse>} Return the service's http response.
     */
    async deleteRequest(
        endpoint: string,
        httpRequest: HttpRequest,

    ): Promise<HttpResponse> {
        httpRequest.headers = this.cleanHeaders(httpRequest.headers);
        return this.makeRequest(() =>
            this.clientTechnology.httpDelete(endpoint, httpRequest),
        );
    }
}

export { AbstractHttpClient, HttpClient };
