import { jest, test, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { DetectionBroker, NotificationCallback } from '../../src/components/detectionBroker';
import { Channel, ChannelModel, Connection, connect } from 'amqplib';

jest.mock('amqplib', () => ({
    connect: jest.fn(),
}));

describe('DetectionBroker - Unit Tests', () => {
    let broker: DetectionBroker<any>;
    let mockConnection: jest.Mocked<Connection>;
    let mockChannel: jest.Mocked<Channel>;
    let mockChannelModel: jest.Mocked<ChannelModel>;

    const instanceId = 'test-instance';
    const queueName = `notifications.${instanceId}`;
    const exchangeName = 'sensor.notifications';

    // Test data
    const testTopic = {
        topic: 'temperature',
        sensorName: 'sensor-001',
        query: 'high',
    };

    const testEvent = {
        sensorName: 'sensor-001',
        type: 'temperature',
        value: 30.5,
        unit: 'celsius',
        timestamp: Date.now(),
        query: { value: 30, name: 'high' },
    };

    const userId = 'user-123';

    beforeEach(() => {
        mockChannel = {
            assertExchange: jest.fn().mockImplementation(() => Promise.resolve({})),
            assertQueue: jest.fn().mockImplementation(() => Promise.resolve({ queue: queueName })),
            bindQueue: jest.fn().mockImplementation(() => Promise.resolve({})),
            consume: jest.fn().mockImplementation((_queue, callback) => {
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

        mockChannelModel = {
            close: jest.fn().mockImplementation(() => Promise.resolve()),
            createChannel: jest.fn().mockImplementation(() => Promise.resolve(mockChannel)),
            createConfirmChannel: jest.fn().mockImplementation(() => Promise.resolve(mockChannel)),
            connection: mockConnection,
            updateSecret: jest.fn().mockImplementation(() => Promise.resolve()),
        } as unknown as jest.Mocked<ChannelModel>;

        const mockConnect = connect as jest.MockedFunction<typeof connect>;
        mockConnect.mockImplementation(() => Promise.resolve(mockChannelModel));

        broker = new DetectionBroker('amqp://localhost', instanceId);
    });

    afterEach(async () => {
        await broker.close();
        jest.clearAllMocks();
    });

    test('should connect successfully', async () => {
        await broker.connect();

        expect(connect).toHaveBeenCalledWith('amqp://localhost');
        expect(mockChannel.assertExchange).toHaveBeenCalledWith(exchangeName, 'topic', { durable: true });
        expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName, {
            durable: true,
            arguments: {
                'x-message-ttl': 24 * 60 * 60 * 1000,
            },
        });
    });

    test('should subscribe user to specific topic pattern', async () => {
        await broker.connect();
        const result = await broker.subscribeUser(userId, testTopic);

        expect(result).toBe(true);
        expect(mockChannel.bindQueue).toHaveBeenCalledWith(queueName, exchangeName, 'temperature.sensor-001.high');
    });

    test('should subscribe user to wildcard topic pattern', async () => {
        await broker.connect();
        const wildcardTopic = { topic: 'temperature' };
        const result = await broker.subscribeUser(userId, wildcardTopic);

        expect(result).toBe(true);
        expect(mockChannel.bindQueue).toHaveBeenCalledWith(queueName, exchangeName, 'temperature.#');
    });

    test('should subscribe user to sensor-specific wildcard pattern', async () => {
        await broker.connect();
        const sensorTopic = { topic: 'temperature', sensorName: 'sensor-001' };
        const result = await broker.subscribeUser(userId, sensorTopic);

        expect(result).toBe(true);
        expect(mockChannel.bindQueue).toHaveBeenCalledWith(queueName, exchangeName, 'temperature.sensor-001.#');
    });

    test('should handle message delivery to subscribed users', async () => {
        const mockCallback: NotificationCallback<string> = jest
            .fn()
            .mockImplementation(async (_userId, _topic, _message) => {
                return Promise.resolve();
            }) as NotificationCallback<string>;

        await broker.connect();
        await broker.subscribeUser(userId, testTopic);

        // Simulate message arrival
        const callback = (mockChannel as any).lastCallback;
        await callback({
            content: Buffer.from(JSON.stringify(testEvent)),
            fields: { routingKey: 'temperature.sensor-001.high' },
        });

        expect(mockCallback).not.toHaveBeenCalled(); // Because we haven't set it yet

        // Now set the callback and try again
        (broker as any).addNotificationCallback(mockCallback);
        await callback({
            content: Buffer.from(JSON.stringify(testEvent)),
            fields: { routingKey: 'temperature.sensor-001.high' },
        });

        expect(mockCallback).toHaveBeenCalledWith(
            expect.any(Set),
            expect.objectContaining({
                topic: 'temperature',
                sensorName: 'sensor-001',
                query: 'high',
            }),
            testEvent
        );
        expect(mockChannel.ack).toHaveBeenCalled();
    });

    test('should unsubscribe user from topic', async () => {
        await broker.connect();
        await broker.subscribeUser(userId, testTopic);

        const result = await broker.unsubscribeUser(userId, testTopic);
        expect(result).toBe(true);
    });

    test('should handle invalid message format', async () => {
        await broker.connect();

        const callback = (mockChannel as any).lastCallback;
        await callback({
            content: Buffer.from('invalid json'),
            fields: { routingKey: 'temperature.sensor-001.high' },
        });

        expect(mockChannel.nack).toHaveBeenCalledWith(expect.anything(), false, false);
    });

    test('should handle connection failure', async () => {
        const mockConnect = connect as jest.MockedFunction<typeof connect>;
        mockConnect.mockRejectedValueOnce(new Error('Connection failed'));

        await broker.connect();
        expect(mockConnection.on).not.toHaveBeenCalled();
    });
});
