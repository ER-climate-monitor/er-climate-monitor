import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { BasicHttpRequest } from '../../../controllers/v0/utils/circuitBreaker/http/httpRequest';

interface DetectionOperations {
    getSensorLocationsOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    getDetectionsOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
    saveDetectionOperation(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
}

class DetectionService<T extends HttpClient> extends AbstractService<T> implements DetectionOperations {
    constructor(
        circuitBreaker: CircuitBreakerClient<T>,
        endpoint: string,
        authenticationClient: AuthenticationClient,
    ) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    public getSensorLocationsOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, headers, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public getDetectionsOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, headers, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    public saveDetectionOperation(endpointPath: string, headers: any, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }
}

export { DetectionService };
