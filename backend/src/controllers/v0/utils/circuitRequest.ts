import CircuitBreaker from "opossum";
import axios, { AxiosError, AxiosResponse } from "axios"
import { DELETE, GET, POST, PUT } from "./httpMethods";

const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

const breaker = new CircuitBreaker(makeRequest, options);

async function makeRequest(service: string, method: string,  path: string, headers: any, body: any): Promise<AxiosResponse<any, any>> {
    const endpoint = service + path;
    console.log(endpoint);
    try {
        switch (method) {
            case (GET): {
                return getRequest(endpoint, headers);
            }
            case (POST): {
                return postRequest(endpoint, headers, body);
            }
            case (PUT): {
                // TODO
            }
            case (DELETE): {
                // TODO
            }
        }
    }catch(error) {
        breaker.fallback(() => "Error, the service is out. Try again later.");
    }
    throw new Error("Error, connection refused");
}

async function getRequest(endpoint: string, headers: any): Promise<AxiosResponse<any, any>> {
    try {
        return axios.get(endpoint, headers);
    }catch(error) {
        throw error;
    }
}

async function postRequest(endpoint: string, headers: any, body: any): Promise<AxiosResponse<any, any>>{
    try {
        return axios.post(endpoint, body, headers);
    }catch(error) {
        throw new Error("Error, connection refused from: " + endpoint);
    }
}


export { breaker }