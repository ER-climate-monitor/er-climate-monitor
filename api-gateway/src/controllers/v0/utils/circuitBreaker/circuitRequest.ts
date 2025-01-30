import CircuitBreaker from 'opossum';
import { HttpMethods } from '../api/httpMethods';
import { AbstractHttpClient, HttpClient } from './http/httpClient';
import { AxiosService, axiosCheckServerError } from './http/axios/axiosClient';
import { HttpResponse } from './http/httpResponse';
import { HttpRequest } from './http/httpRequest';

/**
 * Interface used for describing a generic circuit breaker technology.
 */
interface CircuitBreakerLogic {
    /**
     * Fire the input request to the input service.
     * @param {string} service - Service that will receive our request.
     * @returns {HttpResponse} The service's http response.
     */
    fireRequest(service: string, request: HttpRequest): Promise<HttpResponse>;
    /**
     * Bind the input function to the specific circuit breaker technology used. This function could also be not used at all, but some of the breaker algorithms could call a specific
     * function each time in order to fire their request. This method should only be used if the breaker needs a function to call each time a request is fired.
     * @param requestFunction - The function to bind to the specific circuit breaker technology.
     */
    bindFunction(requestFunction: (service: string, request: HttpRequest) => Promise<HttpResponse>): void;
}

class CircuitBreakerClient<T extends HttpClient> {
    private breaker: CircuitBreakerLogic;
    private httpClient: AbstractHttpClient<T>;
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
    async fireRequest(service: string, request: HttpRequest): Promise<HttpResponse> {
        return this.breaker.fireRequest(service, request);
    }

    private async makeRequest(service: string, request: HttpRequest): Promise<HttpResponse> {
        const endpoint = service + request.path;
        switch (request.method) {
            case HttpMethods.GET: {
                return this.httpClient.getRequest(endpoint, request);
            }
            case HttpMethods.POST: {
                return this.httpClient.postRequest(endpoint, request);
            }
            case HttpMethods.PUT: {
                return this.httpClient.putRequest(endpoint, request);
            }
            case HttpMethods.DELETE: {
                return this.httpClient.deleteRequest(endpoint, request);
            }
            default: {
                throw new Error('Http method not supported: ' + request.method);
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

    bindFunction(requestFunction: (service: string, request: HttpRequest) => Promise<HttpResponse>): void {
        this.breaker = new CircuitBreaker(requestFunction, this.options);
    }

    async fireRequest(service: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return this.breaker?.fire(service, httpRequest) as Promise<HttpResponse>;
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
