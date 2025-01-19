import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { DELETE, GET, POST } from '../../../controllers/v0/utils/api/httpMethods';

interface SensorOperations<X> {
    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
    getAllSensorsOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
}

class SensorService<T extends HttpClient<X>, X> extends AbstractService<T, X> implements SensorOperations<X> {
    constructor(circuitBreaker: CircuitBreakerClient<T, X>, endpoint: string) {
        super(circuitBreaker, endpoint);
    }

    registerOperation(endpointPath: string, headers: any, body: any): Promise<X> {
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, headers, body);
    }

    getAllSensorsOperation(endpointPath: string, headers: any, body: any): Promise<X> {
        throw this.circuitBreaker.fireRequest(this.endpoint, GET, endpointPath, headers, body);
    }

    deleteOperation(endpointPath: string, headers: any, body: any): Promise<X> {
        throw this.circuitBreaker.fireRequest(this.endpoint, DELETE, endpointPath, headers, body);
    }
}

export { SensorService };
