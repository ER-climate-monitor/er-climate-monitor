import { AbstractService } from '../abstractService';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';
import { BasicHttpRequest } from '../../../controllers/v0/utils/circuitBreaker/http/httpRequest';

/**
 * Group the main operations that will be redirected to the Sensor Registry Service.
 */
interface SensorOperations {
    /**
     * Register a new input sensor.
     * @param {string} _endpointPath - Endpoint path where the request will be redirected;
     * @param {Record<string, string | undefined | string[]>} _headers - Input headers that will be redirected to the sensor registry;
     * @param {object} _body - Input sensor information;
     * @returns {Promise<HttpResponse>} Sensor registry response.
     */
    registerOperation(_endpointPath: string, _headers:Record<string, string | undefined | string[]>, _body: object): Promise<HttpResponse>;
    /**
     * Return all the different stored sensors;
     * @param {string} _endpointPath - Endpoint path where the request will be redirected;
     * @param {Record<string, string | undefined | string[]> _headers - Input headers that will be redirected to the sensor registry;
     * @returns {Promise<HttpResponse>} Sensor registry response.
     */
    getAllSensorsOperation(_endpointPath: string, _headers: Record<string, string | undefined | string[]>): Promise<HttpResponse>;
    /**
     * Delete the input sensor.
     * @param {string} _endpointPath - Endpoint path where the request will be redirected;
     * @param {RRecord<string, string | undefined | string[]>} _headers - Input headers;
     * @returns {Promise<HttpResponse>} Sensor registry response.
     */
    deleteOperation(_endpointPath: string, _headers: Record<string, string | undefined | string[]>): Promise<HttpResponse>;
    /**
     * Update the input sensor.
     * @param {string} _endpointPath - Endpoint path where the request will be redirected.
     * @param {Record<string, string>} _headers - Input headers;
     * @param {object} _body - New sensor information
     * @returns {Promise<HttpResponse>} Sensor registry response.
     */
    updateRemoteSensor(_endpointPath: string, _headers: any, _body: any): Promise<HttpResponse>;
}

class SensorService<T extends HttpClient> extends AbstractService<T> implements SensorOperations {
    constructor(circuitBreaker: CircuitBreakerClient<T>, endpoint: string, authenticationClient: AuthenticationClient) {
        super(circuitBreaker, endpoint, authenticationClient);
    }

    registerOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>, body: object): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    getAllSensorsOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, headers, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    deleteOperation(endpointPath: string, headers: Record<string, string | undefined | string[]>,): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.DELETE, endpointPath, headers, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    updateRemoteSensor(endpointPath: string, headers: Record<string, string | undefined | string[]>, body: any): Promise<HttpResponse> {
        const request = new BasicHttpRequest(HttpMethods.PUT, endpointPath, headers, body, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }
}

export { SensorService };
