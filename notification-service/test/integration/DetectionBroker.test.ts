import { test, expect, describe, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { DetectionBroker, NotificationCallback } from '../../src/components/detectionBroker';
import { DetectionEvent, SubscriptionTopic } from '../../src/model/notificationModel';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { Channel, connect as AMQPConnect, Connection, ChannelModel } from 'amqplib';
import Logger from 'js-logger';
import assert from 'assert';

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
    private chm: ChannelModel | undefined;
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
            this.chm = await AMQPConnect(this.brokerUrl);
            this.connection = this.chm.connection;
            this.channel = await this.chm.createChannel();

            assert(this.channel !== undefined);
            await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });

            this.connection?.on('error', (err) => Logger.error('CLIENT ERROR: ', err));
        } catch (error) {
            Logger.error('CLIENT ERROR: ', error);
            throw error;
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
            await this.chm?.close();
        } catch (error) {
            Logger.error('Error closing client connections:', error);
        }
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
    const managementPort = 15672;

    const instanceId = 'test-instance';
    const exchangeName = 'sensor.notifications';

    const testSub: SubscriptionTopic = {
        topic: 'temperature',
        sensorName: 'sensor-001',
        query: 'threshold-high',
    };

    const testUserId = 'user-123';

    beforeAll(async () => {
        container = await new GenericContainer(containerImage)
            .withExposedPorts(containerPort, managementPort)
            .withEnvironment({
                RABBITMQ_DEFAULT_USER: 'guest',
                RABBITMQ_DEFAULT_PASS: 'guest',
            })
            .withStartupTimeout(5000)
            .withWaitStrategy(Wait.forLogMessage('Server startup complete'))
            .start();

        amqpUrl = `amqp://guest:guest@${container.getHost()}:${container.getMappedPort(containerPort)}?frameMax=0x2000`;
        console.log(`RabbitMQ container started: ${amqpUrl}`);

        let connected = false;
        let retries = 0;
        let maxRetries = 5;

        while (!connected && retries < maxRetries) {
            try {
                client = new SensorClient(amqpUrl, exchangeName, {
                    type: testSub.topic,
                    sensorName: testSub.sensorName!,
                    queries: [{ value: 25, name: testSub.query! }],
                });
                await client.connect();

                connected = true;
            } catch (_err) {
                retries++;
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        if (!connected) {
            throw new Error('Failed to connect to RabbitMQ after multiple attempts...');
        }
    });

    beforeEach(async () => {
        broker = new DetectionBroker(amqpUrl, instanceId);
        await broker.connect();
    });

    afterAll(async () => {
        try {
            await client.close();
            await broker.close();
            await container.stop();
        } catch (_) {}
    });

    test('should handle subscriptions for users with different topic specs', async () => {
        let receivedMessages: { detection: DetectionEvent; userIds: string[]; topic: SubscriptionTopic }[] = [];
        const mockCallback: NotificationCallback<DetectionEvent> = async (userIds, topic, detection) => {
            receivedMessages.push({ detection, userIds: Array.from(userIds), topic });
        };

        broker.addNotificationCallback(mockCallback);
        await broker.subscribeUser(testUserId, testSub);
        let res = await broker.subscribeUser('user-321', {
            topic: testSub.topic,
        });

        expect(res).toBeTruthy();

        res = await broker.subscribeUser('user-abc', {
            topic: testSub.topic,
            query: testSub.query,
        });

        expect(res).toBeTruthy();

        res = await broker.subscribeUser('user-bca', {
            topic: testSub.topic,
            sensorName: testSub.sensorName,
        });

        expect(res).toBeTruthy();

        client.publishTestEvent();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        expect(receivedMessages).toHaveLength(4);
        const expectedUsers = [testUserId, 'user-321', 'user-abc', 'user-bca'];

        expect(receivedMessages.flatMap((d) => d.userIds).filter((u) => expectedUsers.includes(u))).toHaveLength(
            expectedUsers.length
        );

        const firstMessage = receivedMessages.filter((m) => m.userIds[0] == testUserId)[0];

        expect(firstMessage.userIds).toEqual([testUserId]);
        expect(firstMessage.topic).toEqual(testSub);
    }, 20000);
});
