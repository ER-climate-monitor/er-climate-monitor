import CircuitBreaker from "opossum";
import axios from "axios"
import { GET } from "./httpMethods";

const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

async function makeRequest(service: string, method: string,  path: string, headers: any, body: any) {
    const endpoint = service + path;
    switch (method) {
        case (GET): {
            return getRequest(endpoint, headers, body)
        }
    }
}

async function getRequest(endpoint: string, headers: any, body: string) {
    console.log(endpoint);
    console.log(headers);
    console.log(body);
    // return axios.get(endpoint, {data});
    return null;
}

const breaker = new CircuitBreaker(makeRequest, options);

export { breaker }