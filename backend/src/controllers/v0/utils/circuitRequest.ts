import CircuitBreaker from "opossum";
import axios, { AxiosError, AxiosResponse } from "axios"
import { DELETE, GET, POST, PUT } from "./httpMethods";

const defaultOptions = {
    timeout: 6000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

class CircuitBreakerClient { 
    private breaker: CircuitBreaker;
    constructor (options: {}) {
        this.breaker = new CircuitBreaker(this.makeRequest.bind(this), options);
    }

    async fireRequest(service: string, method: string,  path: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        return this.breaker.fire(service, method, path, headers, body) as Promise<AxiosResponse<any, any>>;
    }

    private async makeRequest(service: string, method: string,  path: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
        const endpoint = service + path;
        try {
            switch (method) {
                case (GET): {
                    return this.getRequest(endpoint, headers);
                }
                case (POST): {
                    return this.postRequest(endpoint, headers, body);
                }
                case (PUT): {
                    // TODO
                }
                case (DELETE): {
                    // TODO
                }
            }
        }catch(error) {
            this.breaker.fallback(() => "Error, the service is out. Try again later.");
        }
        throw new Error("Error, connection refused");
    }

    private async getRequest(endpoint: string, headers: any): Promise<AxiosResponse<any, any>> {
        try {
            return axios.get(endpoint, headers);
        }catch(error) {
            throw error;
        }
    }

    private async postRequest(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>>{
        try {
            return axios.post(endpoint, body, headers);
        }catch(error) {
            throw new Error("Error, connection refused from: " + endpoint);
        }
    }
}

class BreakerFactory {
    static breakerWithOptions(options: {}) {
        return new CircuitBreakerClient(options)
    }
    
    static breakerWithDefaultOptions() {
        return new CircuitBreakerClient(defaultOptions);
    }
}


export { BreakerFactory, defaultOptions }