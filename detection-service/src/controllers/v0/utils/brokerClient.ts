import { Channel, connect, Connection } from 'amqplib';
import { config } from 'dotenv';
import Logger from 'js-logger';
import { AlertEvent } from 'src/models/v0/alertModel';

config();

class DetectionPublisher {
    private connection: Connection | undefined;
    private channel: Channel | undefined;
    private connected: boolean = false;

    private readonly EXCHANGE_NAME: string = process.env.EXCHANGE_NAME ?? 'sensor.notifications';
    private readonly maxReconnectRetries: number = parseInt(process.env.RECONNECT_RETRIES_NUMBER ?? '5');
    private readonly brokerUrl: string;

    constructor(url: string = process.env.AMQP_URL ?? 'amqp://localhost') {
        this.brokerUrl = url;
    }

    async connect(): Promise<boolean> {
        if (this.connected) return true;

        try {
            Logger.info('⏳ Connecting publisher to RabbitMQ...');
            this.connection = await connect(this.brokerUrl);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });

            this.connection.on('error', (err) => {
                throw new Error(`(Connection error): ${JSON.stringify(err)}`);
            });

            this.connected = true;
            Logger.info(`✅ Successfully connected to ${this.EXCHANGE_NAME}!`);
            return true;
        } catch (error) {
            Logger.error(`⚠️ Something went wrong connecting to ${this.EXCHANGE_NAME}:`, error);
            return this.reconnect();
        }
    }

    async publishEvent(event: AlertEvent): Promise<boolean> {
        if (!this.ensureConnection()) return false;

        try {
            this.channel!.publish(this.EXCHANGE_NAME, event.eventKey, Buffer.from(JSON.stringify(event.alert)), {
                persistent: true,
            });
            Logger.info(`Published event to ${event.eventKey} with content: ${JSON.stringify(event.alert)}`);
        } catch (error) {
            Logger.error(`Error sending alert to: ${event.eventKey}: `, error);
            return false;
        }
        return true;
    }

    private ensureConnection(): boolean {
        if (!this.connected || !this.channel) {
            Logger.error('Publisher not connected. Did you call connect()?');
            return false;
        }
        return true;
    }

    private async reconnect(attempt: number = 1): Promise<boolean> {
        const delay = Math.min(1000 * attempt, 5000);

        if (attempt > this.maxReconnectRetries) {
            Logger.error(' ❌ Max reconnection attempts reached...');
            return false;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return await this.connect();
        } catch (error) {
            Logger.error(`Reconnection attempt ${attempt} failed: `, error);
            return await this.reconnect(attempt + 1);
        }
    }

    async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
            this.connected = false;
        } catch (_) {
            this.connected = false;
        }
    }
}

const detectionPublisher = new DetectionPublisher();

export { detectionPublisher };
