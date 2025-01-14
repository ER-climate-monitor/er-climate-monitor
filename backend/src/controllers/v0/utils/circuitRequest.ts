import CircuitBreaker from "opossum";

async function makeRequest(service: string, path: string, data: any) {

}

const breaker = new CircuitBreaker(makeRequest);

export { breaker }