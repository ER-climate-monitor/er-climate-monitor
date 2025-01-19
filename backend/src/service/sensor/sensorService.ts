import { AbstractService } from "../abstractService"
import { HttpClient } from "../../controllers/v0/utils/circuitBreaker/http/httpClient"
import { CircuitBreakerClient } from "../../controllers/v0/utils/circuitBreaker/circuitRequest";

interface SensorOperations<X> {
    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
    getAllSensorsOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
}

class SensorService<T extends HttpClient<X>, X> extends AbstractService<T, X> implements SensorOperations<X> {
    constructor(circuitBreaker: CircuitBreakerClient<T, X>, endpoint: string) {
        super(circuitBreaker, endpoint);
    }

    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<X> {
        throw new Error("TODO");
    }

    getAllSensorsOperation(_endpointPath: string, _headers: any, _body: any): Promise<X> {
        throw new Error("TODO");
    }

    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<X> {
        throw new Error("TODO");
    }
}

export { SensorService }