import { NOTIFICATION_ENDPOINT } from '../../../../models/v0/serviceModels';
import { NotificationService } from '../../../../service/v0/notification/notificationService';
import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';

const circuitBreaker = BreakerFactory.axiosBreakerWithDefaultOptions();
const notificationService = new NotificationService(circuitBreaker, NOTIFICATION_ENDPOINT);

export { notificationService };
