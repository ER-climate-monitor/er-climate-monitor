import { HttpMethods } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AbstractService } from '../abstractService';
import { AuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { Subscription } from '../../../controllers/v0/domain/notifications/notificationController';

export class NotificationService<T extends HttpClient> extends AbstractService<T> {
    constructor(cb: CircuitBreakerClient<T>, endpoint: string, authenticationClient: AuthenticationClient) {
        super(cb, endpoint, authenticationClient);
    }

    async suscribeUser(endpointPath: string, sub: Subscription) {
        return this.circuitBreaker.fireRequest(this.endpoint, HttpMethods.POST, endpointPath, {}, sub);
    }

    async getUserSubscriptions(endpointPath: string, userId: string) {
        endpointPath = endpointPath + '?userId=' + userId;
        return this.circuitBreaker.fireRequest(this.endpoint, HttpMethods.GET, endpointPath, {}, {});
    }

    async getNotificationsForUser(endpointPath: string, userId: string) {
        endpointPath = endpointPath + '?userId=' + userId;
        return this.circuitBreaker.fireRequest(this.endpoint, HttpMethods.GET, endpointPath, {}, {});
    }

    async restoreUserSubscriptions(endpointPath: string, userId: string) {
        endpointPath = endpointPath + '?userId=' + userId;
        return this.circuitBreaker.fireRequest(this.endpoint, HttpMethods.GET, endpointPath, {}, {});
    }

    async unsubscribeUser(endpointPath: string, userId: string, topicAddr: string) {
        endpointPath = `${endpointPath}?userId=${userId}&topicAddr=${topicAddr}`;
        return this.circuitBreaker.fireRequest(this.endpoint, HttpMethods.DELETE, endpointPath, {}, {});
    }
}
