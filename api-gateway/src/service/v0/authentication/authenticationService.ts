import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';
import { BasicHttpRequest } from '../../../controllers/v0/utils/circuitBreaker/http/httpRequest';

/**
 * Main Authentication service operation.
 */
interface AuthenticationOperations {
    /**
     * Register the input User.
     * @param {string} _endpointPath - Endpoint wehere the request will be redirected.
     * @param {Record<string, string | undefined | string[]>} _headers - Input headers
     * @param {object} _body - User's information.
     * @returns {Promise<HttpResponse>} Authentication service response.
     */
    registerOperation(_endpointPath: string, _headers: Record<string, string | undefined | string[]>, _body: object): Promise<HttpResponse>;
    /**
     * Login the input user.
     * @param {string} _endpointPath - Endpoint where the input request will be redirected.
     * @param {Record<string, string | undefined | string[]>} _headers - Input headers
     * @param {object} _body - User's login information
     * @returns {Promise<HttpResponse>} Authentication service response.
     */
    loginOperation(_endpointPath: string, _headers: Record<string, string | undefined | string[]>, _body: object): Promise<HttpResponse>;
    /**
     * Check if the input token is valid.
     * @param {string} _endpointPath - Endpoint where the request will be redirected.
     * @param {Record<string, string | undefined | string[]>} _headers - Input headers.
     * @param {object} _body - Token info
     * @returns {Promise<HttpResponse>} Authentication service response.
     */
    authenticateTokenOperation(_endpointPath: string, _headers: Record<string, string | undefined | string[]>, _body: object): Promise<HttpResponse>;
    /**
     * Delete the input user.
     * @param {string} _endpointPath - Endpoint where the request will be redirected.
     * @param {Record<string, string | undefined | string[]>} _headers - Input headers.
     */
    deleteOperation(_endpointPath: string, _headers: Record<string, string | undefined | string[]>, queries: Record<string, string>): Promise<HttpResponse>;
}

class AuthenticationService<T extends HttpClient> extends AbstractService<T> implements AuthenticationOperations {
    constructor(circuitBreaker: CircuitBreakerClient<T>, endpoint: string, authenticationClient: AuthenticationClient) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    public async registerOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>, body: object): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public loginOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>, body: object): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public authenticateTokenOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>, body: object): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public deleteOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>, queries: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.DELETE, endpointPath, headers, {}, {}, queries);
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }
}

export { AuthenticationService };
