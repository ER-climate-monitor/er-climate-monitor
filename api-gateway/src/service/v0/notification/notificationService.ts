import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AbstractService } from '../abstractService';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { Subscription } from '../../../controllers/v0/domain/notifications/notificationController';
import { BasicHttpRequest } from '../../../controllers/v0/utils/circuitBreaker/http/httpRequest';

/**
 * TODO:
 */
export class NotificationService<T extends HttpClient> extends AbstractService<T> {
    constructor(cb: CircuitBreakerClient<T>, endpoint: string, authenticationClient: AuthenticationClient) {
        super(cb, endpoint, authenticationClient);
    }

    async suscribeUser(endpointPath: string, sub: Subscription) {
        const request = new BasicHttpRequest(HttpMethods.POST, endpointPath, {}, sub, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    async getUserSubscriptions(endpointPath: string, userId: string) {
        endpointPath = endpointPath + '?userId=' + userId;
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, {}, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    async getNotificationsForUser(endpointPath: string, userId: string) {
        endpointPath = endpointPath + '?userId=' + userId;
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, {}, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    async restoreUserSubscriptions(endpointPath: string, userId: string) {
        endpointPath = endpointPath + '?userId=' + userId;
        const request = new BasicHttpRequest(HttpMethods.GET, endpointPath, {}, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }

    async unsubscribeUser(endpointPath: string, userId: string, topicAddr: string) {
        endpointPath = `${endpointPath}?userId=${userId}&topicAddr=${topicAddr}`;
        const request = new BasicHttpRequest(HttpMethods.DELETE, endpointPath, {}, {}, {}, {});
        return this.circuitBreaker.fireRequest(this.endpoint, request);
    }
}
