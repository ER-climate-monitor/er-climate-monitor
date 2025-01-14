import { test, expect, describe, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { MessageBroker } from '../../src/messageBroker';

describe('MessageBroker - Integration Tests', () => {
    let container: StartedTestContainer;
    let broker: MessageBroker<string>;
    let amqpUrl: string;

    const containerImage = 'rabbitmq:management-alpine';
    const containerPort = 5672;

    const topicName = 'test-topic';

    beforeAll(async () => {
        container = await new GenericContainer(containerImage).withExposedPorts(containerPort, 15672).start();
        amqpUrl = `amqp://${container.getHost()}:${container.getMappedPort(containerPort)}`;
    });

    afterAll(async () => await container.stop());

    beforeEach(() => {
        broker = new MessageBroker(amqpUrl);
    });

    afterEach(async () => {
        await broker.close();
    });

    test('should handle complete message flow', async () => {
        const receivedMessages: any[] = [];
        const mockCallback = async (userId: number, topic: string, message: string) => {
            receivedMessages.push({ userId, message });
        };

        await broker.connect();
        broker.setNotificationCallback(mockCallback);

        await broker.createTopic(topicName);
        await broker.subscribeUser(1, topicName);
        await broker.subscribeUser(2, topicName);

        const testMessage = { type: 'test', content: 'hello' };
        await broker.publish(topicName, testMessage);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(receivedMessages).toHaveLength(2);
        expect(receivedMessages).toContainEqual({
            userId: 1,
            message: testMessage,
        });
        expect(receivedMessages).toContainEqual({
            userId: 2,
            message: testMessage,
        });
    });

    test('should handle user unsubscribe', async () => {
        const receivedMessages: any[] = [];
        const mockCallback = async (userId: number, topic: string, message: string) => {
            receivedMessages.push({ userId, message });
        };

        await broker.connect();
        broker.setNotificationCallback(mockCallback);

        await broker.createTopic(topicName);
        await broker.subscribeUser(1, topicName);
        await broker.subscribeUser(2, topicName);

        await broker.unsubscribeUser(2, topicName);
        const testMessage = { type: 'test', content: 'hello' };
        await broker.publish(topicName, testMessage);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(receivedMessages).toHaveLength(1);
        expect(receivedMessages[0]).toEqual({
            userId: 1,
            message: testMessage,
        });
    });
});
