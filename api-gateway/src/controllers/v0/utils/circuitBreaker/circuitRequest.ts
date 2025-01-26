import CircuitBreaker from 'opossum';
import { DELETE, GET, POST, PUT } from '../api/httpMethods';
import { AbstractHttpClient, HttpClient } from './http/httpClient';
import { AxiosService, axiosCheckServerError } from './http/axios/axiosClient';
import { HttpResponse } from './http/httpResponse';

const defaultOptions = {
    timeout: 6000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000, // After 30 seconds, try again.
};

const ERROR_FILTER = 'errorFilter';

class CircuitBreakerClient<T extends HttpClient> {
    private breaker: CircuitBreaker;
    private httpClient: AbstractHttpClient<T>;
    constructor(options: { [key: string]: any }, httpClient: AbstractHttpClient<T>) {
        this.breaker = new CircuitBreaker(this.makeRequest.bind(this), options);
        this.httpClient = httpClient;
    }

    async fireRequest(
        service: string,
        method: string,
        path: string,
        headers: any,
        body: any,
        params: any = {},
        queries: any = {},
    ): Promise<HttpResponse> {
        return this.breaker.fire(service, method, path, headers, body, params, queries) as Promise<HttpResponse>;
    }

    private async makeRequest(
        service: string,
        method: string,
        path: string,
        headers: any,
        body: any,
        params: any = {},
        queries: any = {},
    ): Promise<HttpResponse> {
        const endpoint = service + path;
        switch (method) {
            case GET: {
                return this.httpClient.getRequest(endpoint, headers, body, params, queries);
            }
            case POST: {
                return this.httpClient.postRequest(endpoint, headers, body, params, queries);
            }
            case PUT: {
                return this.httpClient.putRequest(endpoint, headers, body, params, queries);
            }
            case DELETE: {
                return this.httpClient.deleteRequest(endpoint, headers, body, params, queries);
            }
            default: {
                throw new Error('Http method not supported: ' + method);
            }
        }
    }
}

class BreakerFactory {
    static axiosBreakerWithDefaultOptions() {
        let options: { [key: string]: any } = defaultOptions;
        options[ERROR_FILTER] = axiosCheckServerError;
        return new CircuitBreakerClient(options, new AxiosService());
    }
}

export { BreakerFactory, defaultOptions, CircuitBreakerClient };
