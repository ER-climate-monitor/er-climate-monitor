import { GET, POST } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AbstractService } from '../abstractService';
import { IAuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { HttpResponse } from '../../../controllers/v0/utils/circuitBreaker/http/httpResponse';

export class NotificationService<T extends HttpClient> extends AbstractService<T> {
    constructor(cb: CircuitBreakerClient<T>, endpoint: string, authenticationClient: IAuthenticationClient) {
        super(cb, endpoint, authenticationClient);
    }

    async getTopics(endpointPath: string): Promise<HttpResponse> {
        return this.circuitBreaker.fireRequest(this.endpoint, GET, endpointPath, null, null);
    }

    async getTopicQueries(endpointPath: string, topicId: string): Promise<HttpResponse> {
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
