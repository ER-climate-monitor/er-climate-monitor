import CircuitBreaker from "opossum";
import axios, { AxiosResponse } from "axios"
import { DELETE, GET, POST, PUT } from "./httpMethods";

const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

const breaker = new CircuitBreaker(makeRequest, options);

async function makeRequest(service: string, method: string,  path: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
    const endpoint = service + path;
    switch (method) {
        case (GET): {
            return getRequest(endpoint, headers);
        }
        case (POST): {
            // TODO
        }
        case (PUT): {
            // TODO
        }
        case (DELETE): {
            // TODO
        }
    }
    throw Error();
}

async function getRequest(endpoint: string, headers: any): Promise<AxiosResponse<any, any>> {
    try {
        return axios.get(endpoint, headers);
    }catch(error) {
        breaker.fallback(() => "Error, out of service. Try again later.");
        throw error;
    }
}



export { breaker }