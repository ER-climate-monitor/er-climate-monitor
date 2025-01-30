import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';
import { BasicHttpRequest } from '../../../controllers/v0/utils/circuitBreaker/http/httpRequest';

/**
 * TODO: 
 */
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
        authenticationClient: AuthenticationClient,
    ) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    public async registerOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public loginOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public authenticateTokenOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public deleteOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.DELETE, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }
}

export { AuthenticationService };
