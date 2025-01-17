import { POST } from '../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpClient } from '../../controllers/v0/utils/circuitBreaker/http/httpClient';

interface AuthenticationOperations<X> {
    registerOperation(endpointPath: string, headers: any, body: any): Promise<X>;
    loginOperation(endpointPath: string, headers: any, body: any): Promise<X>;
    authenticateTokenOperation(endpointPath: string, headers: any, body: any): Promise<X>;
}

class AuthenticationService<T extends HttpClient<X>, X> implements AuthenticationOperations<X> {
    private authenticationEndpoint: string;
    private circuitBreaker: CircuitBreakerClient<T, X>;

    constructor(circuitBreaker: CircuitBreakerClient<T, X>, endpoint: string) {
        this.authenticationEndpoint = endpoint;
        this.circuitBreaker = circuitBreaker;
    }

    public async registerOperation(endpointPath: string, headers: any, body: any): Promise<X> {
        return this.circuitBreaker.fireRequest(this.authenticationEndpoint, POST, endpointPath, headers, body);
    }

    public loginOperation(endpointPath: string, headers: any, body: any): Promise<X> {
        return this.circuitBreaker.fireRequest(this.authenticationEndpoint, POST, endpointPath, headers, body);
    }

    public authenticateTokenOperation(endpointPath: string, headers: any, body: any): Promise<X> {
        return this.circuitBreaker.fireRequest(this.authenticationEndpoint, POST, endpointPath, headers, body);
    }
}

export { AuthenticationService };
