import { HttpClient } from "../controllers/v0/utils/circuitBreaker/http/httpClient";
import { CircuitBreakerClient } from "../controllers/v0/utils/circuitBreaker/circuitRequest";

abstract class AbstractService<T extends HttpClient<X>, X> {
    protected endpoint: string;
    protected circuitBreaker: CircuitBreakerClient<T, X>;

    constructor(circuitBreaker: CircuitBreakerClient<T, X>, endpoint: string) {
        this.endpoint= endpoint;
        this.circuitBreaker = circuitBreaker;
    }
}

export { AbstractService }