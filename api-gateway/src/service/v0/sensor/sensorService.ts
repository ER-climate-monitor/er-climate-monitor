import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';
import { BasicHttpRequest } from '../../../controllers/v0/utils/circuitBreaker/http/httpRequest';

/**
 * TODO:
 */
interface SensorOperations {
    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    getAllSensorsOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    updateRemoteSensor(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
}

class SensorService<T extends HttpClient> extends AbstractService<T> implements SensorOperations {
    constructor(circuitBreaker: CircuitBreakerClient<T>, endpoint: string, authenticationClient: AuthenticationClient) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    registerOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    getAllSensorsOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    deleteOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.DELETE, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    updateRemoteSensor(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.PUT, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }
}

export { SensorService };
