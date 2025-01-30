import { HttpClient } from '../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { CircuitBreakerClient } from '../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { AuthenticationClient } from '../../controllers/v0/utils/redis/redisClient';

/**
 * Abstract class that will be used for interacting with a specific service.
 * @template {T extends HttpClient} type that will be used for making all the different http requests.
 */
abstract class AbstractService<T extends HttpClient> {
    protected endpoint: string;
    protected circuitBreaker: CircuitBreakerClient<T>;
    authenticationClient: AuthenticationClient;

    /**
     * Initialise the different attributes inside this class;
     * @param {CircuitBreakerClient<T>} circuitBreaker - Circuit breaker client that will be used for making all the different requests. This attribute manages all the requests.
     * @param {string} endpoint - the endpoint that will receive our request, It is the Service's address.
     * @param {AuthenticationClient} authenticationClient - Attribute that is used for interacting with the authentication store.
     */
    constructor(circuitBreaker: CircuitBreakerClient<T>, endpoint: string, authenticationClient: AuthenticationClient) {
        this.endpoint = endpoint;
        this.circuitBreaker = circuitBreaker;
        this.authenticationClient = authenticationClient;
    }
}

export { AbstractService };
