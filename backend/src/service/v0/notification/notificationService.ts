import { GET, POST } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AbstractService } from '../abstractService';

export class NotificationService<T extends HttpClient<X>, X> extends AbstractService<T, X> {
    constructor(cb: CircuitBreakerClient<T, X>, endpoint: string) {
        super(cb, endpoint);
    }

    async getTopics(endpointPath: string): Promise<X> {
        return this.circuitBreaker.fireRequest(this.endpoint, GET, endpointPath, null, null);
    }

    async getTopicQueries(endpointPath: string, topicId: string): Promise<X> {
        endpointPath = this.buildendpointWithParams(endpointPath, { topic: topicId });
        return this.circuitBreaker.fireRequest(this.endpoint, GET, endpointPath, null, null);
    }

    async suscribeUser(endpointPath: string, params: Record<string, string | number>) {
        endpointPath = this.buildendpointWithParams(endpointPath, params);
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, null, null);
    }

    private buildendpointWithParams(endpointPath: string, params: Record<string, string | number>): string {
        if (!params || Object.keys(params).length == 0) {
            return endpointPath;
        }
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            queryParams.append(key, String(value));
        }
        return endpointPath + `?${queryParams.toString()}`;
    }
}
