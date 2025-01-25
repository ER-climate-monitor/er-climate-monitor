import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';
import { AuthenticationService } from '../../../../service/v0/authentication/authenticationService';
import { AUTHENTICATION_ENDPOINT } from '../../../../models/v0/serviceModels';
import { authenticationRedisClient } from '../../utils/redis/redisClient';
const breaker = BreakerFactory.axiosBreakerWithDefaultOptions();

const authenticationService = new AuthenticationService(breaker, AUTHENTICATION_ENDPOINT, authenticationRedisClient);

export { authenticationService };
