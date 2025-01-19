import { BreakerFactory } from '../../utils/circuitBreaker/circuitRequest';
import { SensorService } from '../../../../service/v0/sensor/sensorService';
import { SENSOR_REGISTRY_ENDPOINT } from '../../../../models/v0/serviceModels';

const breaker = BreakerFactory.axiosBreakerWithDefaultOptions();
const sensorService = new SensorService(breaker, SENSOR_REGISTRY_ENDPOINT);

export { sensorService };
