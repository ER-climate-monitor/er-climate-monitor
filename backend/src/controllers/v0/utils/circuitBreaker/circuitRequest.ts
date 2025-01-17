import CircuitBreaker from 'opossum';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { DELETE, GET, POST, PUT } from '../api/httpMethods';
import { AbstractHttpClient, HttpClient } from './http/httpClient';
import { AxiosService } from './http/axios/axiosClient';

const defaultOptions = {
    timeout: 6000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000, // After 30 seconds, try again.
};

class CircuitBreakerClient<T extends HttpClient<X>, X> {
    private breaker: CircuitBreaker;
    private httpClient: AbstractHttpClient<T, X>;
    constructor(options: {}, httpClient: AbstractHttpClient<T, X>) {
        this.breaker = new CircuitBreaker(this.makeRequest.bind(this), options);
        this.httpClient = httpClient;
    }

    async fireRequest(service: string, method: string, path: string, headers: any, body: any): Promise<X> {
        return this.breaker.fire(service, method, path, headers, body) as X;
    }

    private async makeRequest(service: string, method: string, path: string, headers: any, body: any): Promise<X> {
        const endpoint = service + path;
        try {
            switch (method) {
                case GET: {
                    return this.httpClient.getRequest(endpoint, headers);
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
            }
        } catch (error) {
            this.breaker.fallback(() => 'Error, the service is out. Try again later.');
        }
        throw new Error('Error, connection refused');
    }
}

class BreakerFactory {
    static axiosBreakerWithDefaultOptions() {
        return new CircuitBreakerClient(defaultOptions, new AxiosService());
    }
}

export { BreakerFactory, defaultOptions, CircuitBreakerClient };
