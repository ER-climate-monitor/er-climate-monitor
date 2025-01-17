import { jest, test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { MessageBroker, NotificationCallback, SubscriptionTopic } from '../../src/messageBroker';
import { Channel, Connection, connect } from 'amqplib';
import Logger from 'js-logger';
import { Query, Topic } from '../../src/models/notificationModel';

jest.mock('amqplib', () => ({
    connect: jest.fn(),
}));

describe('MessageBroker - Unit Tests', () => {
    let broker: MessageBroker<string>;
    let mockConnection: jest.Mocked<Connection>;
    let mockChannel: jest.Mocked<Channel>;

    const queueName = 'test-queue';
    const testTopicName = 'test-topic';
    const testQueries: Query[] = [{ name: 'test-query-1', desc: 'aaaaaa' }];
    const testTopic: Topic = {
        name: testTopicName,
        desc: 'Some useless description',
        queries: testQueries,
    };

    const exchangeNames = Array.from(testTopic.queries!)
        .map((q) => `notifications.${testTopicName}.${q.name}`)
        .map((name) => [name, 'fanout', { durable: false }]);

    const userId = 1;

    beforeEach(() => {
        mockChannel = {
            assertExchange: jest.fn().mockImplementation(() => Promise.resolve({})),
            assertQueue: jest.fn().mockImplementation(() => Promise.resolve({ queue: queueName })),
            bindQueue: jest.fn().mockImplementation(() => Promise.resolve({})),
            consume: jest.fn().mockImplementation((queue, callback) => {
                (mockChannel as any).lastCallback = callback;
                return Promise.resolve({ consumerTag: 'test-tag' });
            }),
            publish: jest.fn().mockImplementation(() => true),
            ack: jest.fn(),
            nack: jest.fn(),
            close: jest.fn().mockImplementation(() => Promise.resolve()),
        } as unknown as jest.Mocked<Channel>;

        mockConnection = {
            createChannel: jest.fn().mockImplementation(() => Promise.resolve(mockChannel)),
            close: jest.fn().mockImplementation(() => Promise.resolve({})),
            on: jest.fn(),
        } as unknown as jest.Mocked<Connection>;

        const mockConnect = connect as jest.MockedFunction<typeof connect>;
        mockConnect.mockImplementation(() => Promise.resolve(mockConnection));
        broker = new MessageBroker('amqp://localhost');
    });

    afterEach(async () => {
        await broker.close();
        jest.clearAllMocks();
    });

    test('should connect successfully', async () => {
        await broker.connect();
        expect(connect).toHaveBeenCalledWith('amqp://localhost');
        expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    test('should create topic and set up subscription', async () => {
        await broker.connect();
        await broker.createTopic(testTopic);

        expect(mockChannel.assertExchange).toHaveBeenCalledWith(...exchangeNames[0]);
        // expect(mockChannel.assertQueue).toHaveBeenCalledWith('', { exclusive: true });
        // expect(mockChannel.bindQueue).toHaveBeenCalledWith(queueName, exchangeName, '');
    });

    test('should subscribe user to topic', async () => {
        await broker.connect();
        await broker.createTopic(testTopic);
        const sub: SubscriptionTopic = {
            topicName: testTopic.name,
            queryName: testTopic.queries![0].name,
        };
        const result = await broker.subscribeUser(userId, sub);
        expect(result).toBe(true);
    });

    test('should publish message to topic', async () => {
        await broker.connect();
        await broker.createTopic(testTopic);
        const message = { test: 'message' };
        const sub = { topicName: testTopicName, queryName: testTopic.queries![0].name };
        const result = await broker.publish(sub, message);
        expect(result).toBe(true);
    });

    test('should deliver messages to subscribed users', async () => {
        const mockCallback: NotificationCallback<string> = jest
            .fn()
            .mockImplementation(async (userId, topic, message) => {
                Logger.info(`Sending ${message} to ${userId} with topic ${topic}`);
                return Promise.resolve();
            }) as NotificationCallback<string>;

        await broker.connect();
        await broker.createTopic(testTopic);
        broker.setNotificationCallback(mockCallback);

        const sub = {
            topicName: testTopicName,
            queryName: testTopic.queries![0].name,
        };

        await broker.subscribeUser(1, sub);

        // Simulate message arrival
        const message = { test: 'message' };
        const callback = (mockChannel as any).lastCallback;
        await callback({
            content: Buffer.from(JSON.stringify(message)),
        });

        const expectedUserIds = new Set<number>();
        expectedUserIds.add(1);
        expect(mockCallback).toHaveBeenCalledWith(expectedUserIds, sub, message);
        expect(mockChannel.ack).toHaveBeenCalled();
    });
});
