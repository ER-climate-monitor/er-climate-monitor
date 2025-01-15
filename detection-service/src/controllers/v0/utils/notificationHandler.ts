import { config } from 'dotenv';
import axios, { HttpStatusCode } from 'axios';
import { IDetection } from '../../../models/v0/detectionModel';
import { Channel, Connection, connect } from 'amqplib';
import Logger from 'js-logger';

config();

interface Topic {
    name: string;
    desc: string;
    exchange?: string;
}

abstract class EventHandler<E> {
    protected topics: Topic[] = [];
    abstract registerTopic(topic: Topic): Promise<boolean>;
    abstract publishEvent(topicName: string, event: E): Promise<void>;
    abstract close(): Promise<void>;
}

const BASE_ROUTE = '/topics';
const REGISTER_TOPIC_ROUTE = BASE_ROUTE;
const BROKER_ADDR = process.env.AMQP_BROKER_ADDR ?? 'amqp://localhost:5672';

class DetectinNotificationHandler extends EventHandler<IDetection> {
    private topics: Topic[] = [];
    private connection: Connection | undefined;
    private channel: Channel | undefined;

    private async ensureConnection() {
        if (!this.connection || !this.channel) {
            this.connection = await connect(BROKER_ADDR);
            this.channel = await this.connection.createChannel();
        }
    }

    override async registerTopic(topic: Topic): Promise<boolean> {
        return axios.put(REGISTER_TOPIC_ROUTE, topic).then((res) => {
            if (res.status !== HttpStatusCode.Ok) {
                return false;
            }
            const exchange = `notifications.${topic.name}`;
            this.topics.push({ ...topic, exchange });
            return true;
        });
    }

    override async publishEvent(topicName: string, event: IDetection): Promise<void> {
        try {
            await this.ensureConnection();
            if (!this.channel) throw new Error('Channel not initialized.');

            const t = this.topics.find((t) => t.name == topicName);
            if (!t || !t.exchange) {
                throw new Error(`Topic: ${topicName} not found or not properly intialized.`);
            }
            this.channel.publish(t.exchange, '', Buffer.from(JSON.stringify(event)));
        } catch (error) {
            Logger.info('Failed to publish event: ', error);
        }
    }

    override async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
}
