import { NOTIFICATION_ENDPOINT } from '../../../../models/v0/serviceModels';
import { NotificationService } from '../../../../service/v0/notification/notificationService';
import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';
import { authenticationRedisClient } from '../../utils/redis/redisClient';

const circuitBreaker = BreakerFactory.axiosBreakerWithDefaultOptions();
const notificationService = new NotificationService(circuitBreaker, NOTIFICATION_ENDPOINT, authenticationRedisClient);

export { notificationService };
