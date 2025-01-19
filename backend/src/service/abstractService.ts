import { HttpClient } from "../controllers/v0/utils/circuitBreaker/http/httpClient";
import { CircuitBreakerClient } from "../controllers/v0/utils/circuitBreaker/circuitRequest";

abstract class AbstractService<T extends HttpClient<X>, X> {
    protected authenticationEndpoint: string;
    protected circuitBreaker: CircuitBreakerClient<T, X>;

    constructor(circuitBreaker: CircuitBreakerClient<T, X>, endpoint: string) {
        this.authenticationEndpoint = endpoint;
        this.circuitBreaker = circuitBreaker;
    }
}

export { AbstractService }