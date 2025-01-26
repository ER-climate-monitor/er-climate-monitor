import { POST } from '../../../controllers/v0/utils/api/httpMethods';
import { CircuitBreakerClient } from '../../../controllers/v0/utils/circuitBreaker/circuitRequest';
import { HttpClient } from '../../../controllers/v0/utils/circuitBreaker/http/httpClient';
import { AbstractService } from '../abstractService';
import { IAuthenticationClient } from '../../../controllers/v0/utils/redis/redisClient';
import { Subscription } from '../../../controllers/v0/domain/notifications/notificationController';

export class NotificationService<T extends HttpClient> extends AbstractService<T> {
    constructor(cb: CircuitBreakerClient<T>, endpoint: string, authenticationClient: IAuthenticationClient) {
        super(cb, endpoint, authenticationClient);
    }

    async suscribeUser(endpointPath: string, sub: Subscription) {
        return this.circuitBreaker.fireRequest(this.endpoint, POST, endpointPath, null, sub);
    }
}
