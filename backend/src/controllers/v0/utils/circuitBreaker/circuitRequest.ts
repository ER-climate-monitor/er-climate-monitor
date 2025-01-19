import CircuitBreaker from 'opossum';
import { DELETE, GET, POST, PUT } from '../api/httpMethods';
import { AbstractHttpClient, HttpClient } from './http/httpClient';
import { AxiosService, axiosCheckServerError } from './http/axios/axiosClient';

const defaultOptions = {
    timeout: 6000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000, // After 30 seconds, try again.
};

const ERROR_FILTER = 'errorFilter';

class CircuitBreakerClient<T extends HttpClient<X>, X> {
    private breaker: CircuitBreaker;
    private httpClient: AbstractHttpClient<T, X>;
    constructor(options: { [key: string]: any }, httpClient: AbstractHttpClient<T, X>) {
        this.breaker = new CircuitBreaker(this.makeRequest.bind(this), options);
        this.httpClient = httpClient;
    }

    async fireRequest(service: string, method: string, path: string, headers: any, body: any): Promise<X> {
        return this.breaker.fire(service, method, path, headers, body) as X;
    }

    private async makeRequest(service: string, method: string, path: string, headers: any, body: any): Promise<X> {
        const endpoint = service + path;
        switch (method) {
            case GET: {
                return this.httpClient.getRequest(endpoint, headers, body);
            }
            case POST: {
                return this.httpClient.postRequest(endpoint, headers, body);
            }
            case PUT: {
                return this.httpClient.putRequest(endpoint, headers, body);
            }
            case DELETE: {
                return this.httpClient.deleteRequest(endpoint, headers, body);
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
