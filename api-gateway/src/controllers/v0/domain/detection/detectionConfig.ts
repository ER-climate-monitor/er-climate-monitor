import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';
import { DETECTION_ENDPOINT } from '../../../../models/v0/serviceModels';
import { authenticationRedisClient } from '../../utils/redis/redisClient';
import { DetectionService } from '../../../../service/v0/detection/detectionService';
const breaker = BreakerFactory.axiosBreakerWithDefaultOptions();

const detectionService = new DetectionService(breaker, DETECTION_ENDPOINT, authenticationRedisClient);

export { detectionService };
