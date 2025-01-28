import { NotificationCallback } from '../components/detectionBroker';
import { DetectionEvent } from './notificationModel';
import { insertNewDetectionEvent } from './notificationOperations';

export function createDbCallback(): NotificationCallback<DetectionEvent> {
    return async (_userIds, _topic, notification) => {
        insertNewDetectionEvent(notification);
    };
}
