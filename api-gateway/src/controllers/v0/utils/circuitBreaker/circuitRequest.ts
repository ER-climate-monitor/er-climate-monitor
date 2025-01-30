import CircuitBreaker from 'opossum';
import { HttpMethods } from '../api/httpMethods';
import { AbstractHttpClient, HttpClient } from './http/httpClient';
import { AxiosService, axiosCheckServerError } from './http/axios/axiosClient';
import { HttpResponse } from './http/httpResponse';




interface CircuitBreakerLogic {
    /**
     * Fire the input request to the input service.
     * @param {string} service - Service that will receive our request.
     * @param {HttpMethods} method - Input Http method that will be used for doing the request.
     * @param {string} path - Service url path where our request will be redirected.
     * @param {Record<string, string>} headers - Input headers.
     * @param {object} body - Input body.
     * @param {Record<string, string>} params - Input path parameters.
     * @param {Record<string, string} queries - Input query parameters.
     * @returns {HttpResponse} The service's http response.
     */
    fireRequest(service: string, method: HttpMethods, path: string, headers: Record<string, string>, body: object, params: Record<string, string>, queries: Record<string, string>): Promise<HttpResponse>
    /**
     * Bind the input function to the specific circuit breaker technology used. This function could also be not used at all, but some of the breaker algorithms could call a specific
     * function each time in order to fire their request. This method should only be used if the breaker needs a function to call each time a request is fired.
     * @param requestFunction 
     */
    bindFunction(requestFunction: (service: string, method: HttpMethods, path: string, headers: Record<string, string>, body: object, params: Record<string, string>, queries: Record<string, string>) => Promise<HttpResponse>): void
}


class CircuitBreakerClient<T extends HttpClient> {
    private breaker: CircuitBreakerLogic
    private httpClient: AbstractHttpClient<T>
    constructor(breaker: CircuitBreakerLogic, httpClient: AbstractHttpClient<T>) {
        this.breaker = breaker;
        this.httpClient = httpClient;
        this.breaker.bindFunction(this.makeRequest.bind(this));
    }
    /**
     * Fire the input request to the input service.
     * @param {string} service - Service that will receive our request.
     * @param {HttpMethods} method - Input Http method that will be used for doing the request.
     * @param {string} path - Service url path where our request will be redirected.
     * @param headers - Input headers.
     * @param body - Input body.
     * @param params - Input path parameters.
     * @param queries - Input query parameters.
     * @returns {HttpResponse} The service's http response.
     */
    async fireRequest(
        service: string,
        method: HttpMethods,
        path: string,
        headers: Record<string, string>,
        body: object,
        params: Record<string, string> = {},
        queries: Record<string, string> = {},
    ): Promise<HttpResponse> {
        return this.breaker.fireRequest(service, method, path, headers, body, params, queries);
    }
    
    private async makeRequest(
        service: string,
        method: HttpMethods,
        path: string,
        headers: Record<string, string>,
        body: object,
        params: Record<string, string> = {},
        queries: Record<string, string> = {},
    ): Promise<HttpResponse> {
        const endpoint = service + path;
        switch (method) {
            case HttpMethods.GET: {
                return this.httpClient.getRequest(endpoint, headers, params, queries);
            }
            case HttpMethods.POST: {
                return this.httpClient.postRequest(endpoint, headers, body, params, queries);
            }
            case HttpMethods.PUT: {
                return this.httpClient.putRequest(endpoint, headers, body, params, queries);
            }
            case HttpMethods.DELETE: {
                return this.httpClient.deleteRequest(endpoint, headers, params, queries);
            }
            default: {
                throw new Error('Http method not supported: ' + method);
            }
        }
    }
}



class OpossumCircuiBreker implements CircuitBreakerLogic {
    private breaker: CircuitBreaker | undefined;
    options: { [key: string]: any };
    constructor(options: { [key: string]: any }) {
        this.options = options;
    }

    bindFunction(requestFunction: (service: string, method: HttpMethods, path: string, headers: any, body: any, params: any, queries: any) => Promise<HttpResponse>): void {
        this.breaker = new CircuitBreaker(requestFunction, this.options);
    }

    async fireRequest(
        service: string,
        method: HttpMethods,
        path: string,
        headers: any,
        body: any,
        params: any = {},
        queries: any = {},
    ): Promise<HttpResponse> {
        return this.breaker?.fire(service, method, path, headers, body, params, queries) as Promise<HttpResponse>;
    }
}

/**
 * Factory class that will be used for creating new Circuit breaker clients.
 */
class BreakerFactory {
    /**
     * 
     * @returns A new Circuit Breaker client that will use a http client technology Axios and It will use the default options for the breaker.
     */
    static axiosBreakerWithDefaultOptions() {
        const defaultOptions = {
            timeout: 6000, // If our function takes longer than 3 seconds, trigger a failure
            errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
            resetTimeout: 30000, // After 30 seconds, try again.
        };
        const ERROR_FILTER = 'errorFilter';
        let options: { [key: string]: any } = defaultOptions;
        options[ERROR_FILTER] = axiosCheckServerError;
        return new CircuitBreakerClient(new OpossumCircuiBreker(options), new AxiosService());
    }
}

export { BreakerFactory, CircuitBreakerClient };
