import { HttpClient } from '../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { CircuitBreakerClient } from '../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { IAuthenticationClient } from '../../controllers/v0/utils/redis/redisClient';

abstract class AbstractService<T extends HttpClient> {
    protected endpoint: string;
    protected circuitBreaker: CircuitBreakerClient<T>;
    authenticationClient: IAuthenticationClient;

    constructor(
        circuitBreaker: CircuitBreakerClient<T>,
        endpoint: string,
        authenticationClient: IAuthenticationClient,
    ) {
        this.endpoint = endpoint;
        this.circuitBreaker = circuitBreaker;
        this.authenticationClient = authenticationClient;
    }
}

export { AbstractService };
