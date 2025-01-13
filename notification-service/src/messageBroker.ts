import { Connection, Channel, connect } from 'amqplib';
import 'dotenv/config';
import Logger from 'js-logger';

Logger.useDefaults();

type NotificationCallback<T> = (userId: number, message: T) => Promise<void>;

interface Subscription {
    userIds: Set<number>;
    channel: Channel;
    exchange: string;
}

class MessageBroker<T> {
    private connection: Connection | undefined;
    private subscriptions: Map<string, Subscription>;
    private connected: boolean = false;
    private notificationCallback: NotificationCallback<T> | undefined;

    constructor(private readonly connectionUrl: string = process.env.AMQP_URL ?? 'amqp://localhost') {
        this.subscriptions = new Map();
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        try {
            Logger.info('⏳ Connecting to Rabbit-MQ Server ...');
            this.connection = await connect(this.connectionUrl);

            this.connection.on('error', (err) => {
                Logger.error('Connection error: ', err);
                this.connected = false;
                this.reconnect();
            });

            this.connection.on('close', () => {
                Logger.warn('Connection closed, attempting to reconnect...');
                this.connected = false;
                this.reconnect();
            });

            this.connected = true;
            Logger.info('✅ Succesfully connected to broker!');
        } catch (error) {
            Logger.error('❌ ' + error);
        }
    }

    private async reconnect(attempt: number = 1) {
        const maxAttempts = 5;
        const delay = Math.min(1000 * attempt, 5000); // Exponential backoff :)

        if (attempt > maxAttempts) {
            Logger.error('Max reconnections attempts reached!');
            return;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, delay));
            await this.connect();

            // re-establish all subscriptions
            for (const [topic, _] of this.subscriptions.entries()) {
                await this.setupSubscription(topic);
            }
        } catch (error) {
            Logger.error(`Reconnection attempt ${attempt} failed: `, error);
            await this.reconnect(attempt + 1);
        }
    }

    async createTopic(topic: string): Promise<boolean> {
        if (!this.ensureConnection()) return false;

        try {
            if (this.subscriptions.has(topic)) {
                Logger.warn(`Topic '${topic} already exists'`);
                return true;
            }

            await this.setupSubscription(topic);
            return true;
        } catch (error) {
            Logger.error(`Failed to create topic ${topic}: `, error);
            return false;
        }
    }

    private async setupSubscription(topic: string): Promise<void> {
        if (!this.ensureConnection()) throw new Error('No connection available');

        const channel = await (this.connection as Connection).createChannel();
        const exchange = `notifications.${topic}`;
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        const queue = await channel.assertQueue('', { exclusive: true });

        await channel.bindQueue(queue.queue, exchange, '');

        // restore/create subscriptions
        const existingSubscriptions = this.subscriptions.get(topic);
        const userIds = existingSubscriptions?.userIds ?? new Set<number>();

        this.subscriptions.set(topic, {
            userIds,
            channel,
            exchange,
        });

        channel.consume(queue.queue, async (msg) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());

                if (this.notificationCallback) {
                    const promises = Array.from(userIds).map((userId) =>
                        this.notificationCallback!(userId, content).catch((err) =>
                            Logger.error(`Failed to notify user ${userId}: `, err)
                        )
                    );

                    await Promise.allSettled(promises);
                }

                channel.ack(msg);
            } catch (error) {
                Logger.error('Error processing message: ', error);
                channel.nack(msg, false, false);
            }
        });
    }

    async subscribeUser(userId: number, topic: string): Promise<boolean> {
        if (!this.ensureConnection()) return false;

        const subscription = this.subscriptions.get(topic);

        if (!subscription) {
            Logger.error(`Topic '${topic}' does not exist!`);
            return false;
        }

        subscription.userIds.add(userId);
        Logger.info(`User ${userId} subscribed to topic: ${topic}`);
        return true;
    }

    async unsubscribeUser(userId: number, topic: string): Promise<boolean> {
        const subscription = this.subscriptions.get(topic);

        if (!subscription) return false;

        subscription.userIds.delete(userId);
        Logger.info(`User ${userId} ubsubscribed from topic: ${topic}`);
        return true;
    }

    async publish<T>(topic: string, message: T): Promise<boolean> {
        if (!this.ensureConnection()) return false;
        const subscription = this.subscriptions.get(topic);
        if (!subscription) {
            Logger.error(`Topic '${topic}' does not exist!`);
            return false;
        }

        try {
            const success = subscription.channel.publish(
                subscription.exchange,
                '',
                Buffer.from(JSON.stringify(message))
            );
            Logger.info(`Message '${JSON.stringify(message)}' sent successfully to topic: ${topic}`);
            return success;
        } catch (error) {
            Logger.error(`Failed to publish to ${topic} message:  ${message}. Got error: `, error);
            return false;
        }
    }

    async close(): Promise<void> {
        for (const subscription of this.subscriptions.values()) {
            await subscription.channel.close();
        }
        await this.connection?.close();
        this.connected = false;
    }

    setNotificationCallback(callback: NotificationCallback<T>) {
        this.notificationCallback = callback;
    }

    private ensureConnection(): boolean {
        if (!this.connected || !this.connection) {
            Logger.error(`Connection to broker has not been established yet. Have you used 'connect' before?`);
            return false;
        }
        return true;
    }
}

const notificationBroker = new MessageBroker();

export { NotificationCallback, MessageBroker, notificationBroker };
