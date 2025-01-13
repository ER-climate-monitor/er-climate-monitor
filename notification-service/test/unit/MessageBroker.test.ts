import { jest, test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { MessageBroker, NotificationCallback } from '../../src/messageBroker';
import { Channel, Connection, connect } from 'amqplib';
import { mock } from 'node:test';
import Logger from 'js-logger';

jest.mock('amqplib', () => ({
    connect: jest.fn(),
}));

describe('MessageBroker - Unit Tests', () => {
    let broker: MessageBroker<string>;
    let mockConnection: jest.Mocked<Connection>;
    let mockChannel: jest.Mocked<Channel>;

    const queueName = 'test-queue';
    const testTopicName = 'test-topic';
    const exchangeName = 'notifications.' + testTopicName;
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
        expect(mockConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    test('should create topic and set up subscription', async () => {
        await broker.connect();
        await broker.createTopic(testTopicName);

        expect(mockChannel.assertExchange).toHaveBeenCalledWith(exchangeName, 'fanout', {
            durable: false,
        });
        expect(mockChannel.assertQueue).toHaveBeenCalledWith('', { exclusive: true });
        expect(mockChannel.bindQueue).toHaveBeenCalledWith(queueName, exchangeName, '');
    });

    test('should subscribe user to topic', async () => {
        await broker.connect();
        await broker.createTopic(testTopicName);
        const result = await broker.subscribeUser(userId, testTopicName);
        expect(result).toBe(true);
    });

    test('should publish message to topic', async () => {
        await broker.connect();
        await broker.createTopic(testTopicName);
        const message = { test: 'message' };
        const result = await broker.publish(testTopicName, message);
        expect(result).toBe(true);
        expect(mockChannel.publish).toHaveBeenCalledWith(exchangeName, '', expect.any(Buffer));
    });

    test('should deliver messages to subscribed users', async () => {
        const mockCallback: NotificationCallback<string> = jest.fn().mockImplementation(async (userId, message) => {
            Logger.info(`Sending ${message} to ${userId}`);
            return Promise.resolve();
        }) as NotificationCallback<string>;

        await broker.connect();
        await broker.createTopic('test-topic');
        broker.setNotificationCallback(mockCallback);
        await broker.subscribeUser(1, 'test-topic');

        // Simulate message arrival
        const message = { test: 'message' };
        const callback = (mockChannel as any).lastCallback;
        await callback({
            content: Buffer.from(JSON.stringify(message)),
        });

        expect(mockCallback).toHaveBeenCalledWith(1, message);
        expect(mockChannel.ack).toHaveBeenCalled();
    });
});
