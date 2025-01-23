import { test, expect, describe, beforeAll, beforeEach, afterAll } from '@jest/globals';
import {
    DetectionBroker,
    DetectionEvent,
    NotificationCallback,
    SubscriptionTopic,
} from '../../src/components/detectionBroker';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Channel, connect, Connection } from 'amqplib';
import Logger from 'js-logger';

interface Sensor {
    sensorName: string;
    type: string;
    queries: {
        value: number;
        name: string;
    }[];
}

class SensorClient {
    private brokerUrl: string;
    private connection: Connection | undefined;
    private channel: Channel | undefined;
    private sensor: Sensor;
    private readonly EXCHANGE_NAME: string;

    constructor(url: string, exchange: string, sensor: Sensor) {
        this.brokerUrl = url;
        this.EXCHANGE_NAME = exchange;
        this.sensor = sensor;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await connect(this.brokerUrl);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });
        } catch (error) {
            Logger.error('CLIENT ERROR: ', error);
        }
    }

    publishTestEvent() {
        if (!this.channel) {
            Logger.error("I'm not yet connected!");
            return;
        }
        try {
            const reading = this.getTestReading();
            for (const query of this.sensor.queries) {
                if (reading.value >= query.value) {
                    const routingKey = `${this.sensor.type}.${this.sensor.sensorName}.${query.name}`;
                    const message: DetectionEvent = {
                        sensorName: this.sensor.sensorName,
                        type: this.sensor.type,
                        value: 30.5,
                        unit: 'celsius',
                        timestamp: Date.now(),
                        query: this.sensor.queries[0],
                    };

                    const messageBuffer = Buffer.from(JSON.stringify(message));
                    this.channel.publish(this.EXCHANGE_NAME, routingKey, messageBuffer);
                }
            }
        } catch (error) {
            Logger.error('CLIENT ERROR: ', error);
        }
    }

    async close() {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (_) {}
    }

    getTestReading() {
        return {
            value: 30.5,
            unit: 'celsius',
            timestamp: Date.now(),
            query: this.sensor.queries[0],
        };
    }
}

describe('DetectionBroker - Integration Tests', () => {
    let container: StartedTestContainer;
    let broker: DetectionBroker<DetectionEvent>;
    let client: SensorClient;

    let amqpUrl: string;
    const containerImage = 'rabbitmq:management-alpine';
    const containerPort = 5672;

    const instanceId = 'test-instance';
    const exchangeName = 'sensor.notifications';

    const testSub: SubscriptionTopic = {
        topic: 'temperature',
        sensorName: 'sensor-001',
        query: 'threshold-high',
    };

    const testUserId = 'user-123';

    beforeAll(async () => {
        container = await new GenericContainer(containerImage).withExposedPorts(containerPort, 15672).start();
        amqpUrl = `amqp://${container.getHost()}:${container.getMappedPort(containerPort)}`;
        client = new SensorClient(amqpUrl, exchangeName, {
            type: testSub.topic,
            sensorName: testSub.sensorName!,
            queries: [{ value: 25, name: testSub.query! }],
        });
        client.connect();
    });

    beforeEach(() => {
        broker = new DetectionBroker(amqpUrl, instanceId);
    });

    afterAll(async () => {
        await broker.close();
        await client.close();
        await container.stop();
    });

    test('should handle subscriptions for users with different topic specs', async () => {
        let receivedMessages: { detection: DetectionEvent; userIds: string[]; topic: SubscriptionTopic }[] = [];
        const mockCallback: NotificationCallback<DetectionEvent> = async (userIds, topic, detection) => {
            receivedMessages.push({ detection, userIds: Array.from(userIds), topic });
        };

        await broker.connect();
        broker.notificationCallback = mockCallback;
        await broker.subscribeUser(testUserId, testSub);
        await broker.subscribeUser('user-321', {
            topic: testSub.topic,
        });

        await broker.subscribeUser('user-abc', {
            topic: testSub.topic,
            query: testSub.query,
        });

        await broker.subscribeUser('user-bca', {
            topic: testSub.topic,
            sensorName: testSub.sensorName,
        });

        client.publishTestEvent();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(receivedMessages).toHaveLength(4);
        expect(receivedMessages.flatMap((d) => d.userIds)).toEqual([testUserId, 'user-321', 'user-abc', 'user-bca']);

        const firstMessage = receivedMessages.filter((m) => m.userIds[0] == testUserId)[0];

        expect(firstMessage.userIds).toEqual([testUserId]);
        expect(firstMessage.topic).toEqual(testSub);
    }, 2000);
});
