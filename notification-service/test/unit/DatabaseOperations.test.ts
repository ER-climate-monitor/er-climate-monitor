import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { deleteModel } from 'mongoose';
import { test, expect, describe, beforeAll, afterAll, afterEach } from '@jest/globals';
import {
    getUserSubscriptions,
    createUserSubscription,
    deleteUserSubscription,
    insertNewDetectionEvent,
    retrieveDetectionEventsOfType,
} from '../../src/model/notificationOperations';
import { DetectionEvent, SubscriptionTopic } from '../../src/model/notificationModel';

describe('NotificationService - unit test', () => {
    let mongoServer: MongoMemoryServer;

    const mockSub: SubscriptionTopic = {
        topic: 'water',
        sensorName: 'gambettola',
    };

    const testDetectionEvent: DetectionEvent = {
        sensorName: mockSub.sensorName!,
        type: mockSub.topic,
        value: 12.2,
        unit: 'm',
        timestamp: 123223,
        query: { value: 10.0, name: 'thrs-25%' },
    };

    const testUser = 'testUser-123';

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { dbName: 'notifications-database' });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await mongoose.connection.db?.dropDatabase();
    });

    describe('UserSubscriptions - CRUD unit test', () => {
        test('should properly create a new notification', async () => {
            const res = await createUserSubscription(testUser, mockSub);
            expect(res).toBeTruthy();
        });

        test('should get a saved notification', async () => {
            await createUserSubscription(testUser, mockSub);
            const sub = await getUserSubscriptions(testUser);
            expect(sub).not.toBeNull();
            expect(sub!.userId).toBe(testUser);
            expect(sub!.subscriptions[0]).toEqual(mockSub);
        });

        test('should get a saved notification', async () => {
            await createUserSubscription(testUser, mockSub);
            await deleteUserSubscription(testUser, mockSub.topic);
            const res = await getUserSubscriptions(testUser);
            expect(res!.subscriptions).toHaveLength(0);
        });
    });

    describe('DetectionEvent - CRUD unit test', () => {
        test('should insert a new detection event', async () => {
            const res = await insertNewDetectionEvent(testDetectionEvent);
            expect(res).toBeTruthy();
        });

        test('should retrive a detection event by type', async () => {
            await insertNewDetectionEvent(testDetectionEvent);
            const events = await retrieveDetectionEventsOfType(mockSub.topic);
            expect(events).toHaveLength(1);

            const event = events[0].toJSON();
            expect(event.id).toBeTruthy();
            expect((event.id as string).startsWith('Object')).toBeFalsy();
            delete event.id;
            expect(event).toEqual(testDetectionEvent);
        });
    });
});
