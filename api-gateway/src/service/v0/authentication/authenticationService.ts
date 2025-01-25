import { DELETE, GET, POST } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { IAuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';

interface AuthenticationOperations {
    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    loginOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    authenticateTokenOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
}

class AuthenticationService<T extends HttpClient> extends AbstractService<T> implements AuthenticationOperations {
    constructor(
        circuitBreaker: CircuitBreakerClient<T>,
        endpoint: string,
        authenticationClient: IAuthenticationClient,
    ) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    public async registerOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, headers, body);
    }

    public loginOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, headers, body);
    }

    public authenticateTokenOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, headers, body);
    }

    public deleteOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, DELETE, endpointPath, headers, body);
    }
}

export { AuthenticationService };
