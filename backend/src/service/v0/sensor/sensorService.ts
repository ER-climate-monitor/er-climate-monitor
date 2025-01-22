import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { DELETE, GET, POST } from '../../../controllers/v0/utils/api/httpMethods';
import { IAuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';

interface SensorOperations {
    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    getAllSensorsOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
}

class SensorService<T extends HttpClient> extends AbstractService<T> implements SensorOperations {
    constructor(
        circuitBreaker: CircuitBreakerClient<T>,
        endpoint: string,
        authenticationClient: IAuthenticationClient,
    ) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    registerOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, headers, body);
    }

    getAllSensorsOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, GET, endpointPath, headers, body);
    }

    deleteOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, DELETE, endpointPath, headers, body);
    }
}

export { SensorService };
