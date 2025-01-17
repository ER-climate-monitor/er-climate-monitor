import { test, expect, describe, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { MessageBroker, NotificationCallback, SubscriptionTopic } from '../../src/messageBroker';
import { Topic, Query } from '../../src/models/notificationModel';

describe('MessageBroker - Integration Tests', () => {
    let container: StartedTestContainer;
    let broker: MessageBroker<string>;
    let amqpUrl: string;

    const containerImage = 'rabbitmq:management-alpine';
    const containerPort = 5672;

    const topicName = 'test-topic';
    const queryName = 'test-query';

    const testTopic: Topic = {
        name: topicName,
        desc: 'useless description',
        queries: [{ name: queryName, desc: 'some other useless description' }],
    };

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
        let receivedMessage: { message: string; userIds: number[] } | undefined;

        const mockCallback: NotificationCallback<string> = async (userIds, _, message) => {
            receivedMessage = { message, userIds: Array.from(userIds) };
        };

        await broker.connect();
        broker.setNotificationCallback(mockCallback);

        await broker.createTopic(testTopic);
        const sub: SubscriptionTopic = { topicName, queryName };
        await broker.subscribeUser(1, sub);
        await broker.subscribeUser(2, sub);

        const testMessage = 'hello';
        await broker.publish(sub, testMessage);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(receivedMessage!['userIds']).toHaveLength(2);
        expect(receivedMessage).toEqual({
            message: testMessage,
            userIds: [1, 2],
        });
    });

    test('should handle user unsubscribe', async () => {
        let receivedMessage: { message: string; userIds: number[] } | undefined;
        const mockCallback: NotificationCallback<string> = async (
            userIds: Set<number>,
            topic: SubscriptionTopic,
            message: string
        ) => {
            receivedMessage = { message, userIds: Array.from(userIds) };
        };

        await broker.connect();
        broker.setNotificationCallback(mockCallback);

        await broker.createTopic(testTopic);
        const sub = { topicName, queryName };
        await broker.subscribeUser(1, sub);
        await broker.subscribeUser(2, sub);

        await broker.unsubscribeUser(2, sub);
        const testMessage = 'hello';
        await broker.publish(sub, testMessage);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(receivedMessage!['userIds']).toHaveLength(1);
        expect(receivedMessage).toEqual({
            message: testMessage,
            userIds: [1],
        });
    });
});
