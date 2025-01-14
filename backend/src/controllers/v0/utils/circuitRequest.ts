import CircuitBreaker from "opossum";
import axios from "axios"

const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

async function makeRequest(service: string, operation: string,  path: string, data: any) {
    
}

async function getRequest(service: string, path: string, data: any) {

}

const breaker = new CircuitBreaker(makeRequest, options);

export { breaker }