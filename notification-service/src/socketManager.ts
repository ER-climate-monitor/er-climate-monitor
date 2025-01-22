import Logger from 'js-logger';
import { Socket, Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { NotificationCallback, SubscriptionTopic, parseSubscription, stringifySubscription } from './DetectionBroker';

Logger.useDefaults();

const generateUID = (): string => crypto.randomUUID();

interface NotificationConnection {
    socket: Socket;
    uid: string;
    topic: SubscriptionTopic;
    lastConnected: Date;
}

class SocketManager {
    private io: Server;
    usersUIDs: Map<string, string>;
    subscriptionsToUID: Map<string, Set<string>>;
    usersConnections: Map<string, NotificationConnection>;
    topicPrefix: string;

    constructor(httpServer: HttpServer, topicPrefix: string = 'notification') {
        this.topicPrefix = topicPrefix;
        this.usersUIDs = new Map();
        this.usersConnections = new Map();
        this.subscriptionsToUID = new Map();
        this.io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.configureSocket();
    }

    private configureSocket() {
        this.io.on('connection', (socket) => {
            Logger.info(`New client connection ${socket.id}`);
            socket.on('register', async (uid: string, topicAddr: string) => {
                try {
                    const sub = parseSubscription(topicAddr, this.topicPrefix);
                    if (!this.subscriptionsToUID.get(JSON.stringify(sub))?.has(uid)) {
                        throw new Error(`User ${uid} is not subscribed for topic: ${JSON.stringify(sub)}`);
                    }
                    this.registerUserSocket(uid, sub, socket);
                    socket.emit('registered', { success: true });
                    Logger.info('User successfuly registered!');
                } catch (error) {
                    socket.emit('registered', { success: false, error: (error as Error).message });
                    Logger.error(`Failed to register user ${uid}: `, error);
                }
            });

            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    private registerUserSocket(uid: string, topic: SubscriptionTopic, socket: Socket) {
        const existingConnection = this.usersConnections.get(uid);
        if (existingConnection) {
            try {
                existingConnection.socket.disconnect(true);
            } catch (error) {
                Logger.warn(`Error disconnecting existing socket for user ${uid}: ${error}`);
            }
        }

        this.usersConnections.set(uid, {
            socket,
            uid,
            topic,
            lastConnected: new Date(),
        });

        socket.on('disconnect', () => {
            if (this.usersConnections.get(uid)?.socket.id == socket.id) {
                this.usersConnections.delete(uid);
                Logger.info(`User ${uid} disconnected and removed from socket registry.`);
            }
        });
    }

    private handleDisconnect(socket: Socket) {
        for (const [uid, connection] of this.usersConnections.entries()) {
            if (connection.socket.id === socket.id) {
                this.usersConnections.delete(uid);
                Logger.info(`User ${uid} successfully disonnected and cleaned up.`);
            }
        }
    }

    sendToTopicSubscribers<T>(topic: SubscriptionTopic, data: T): boolean {
        try {
            let prefix = this.topicPrefix;
            if (prefix) prefix = prefix + '.';
            else prefix = '';
            const sub = stringifySubscription(topic);
            this.io.emit(`${prefix}${sub}`, data);
            Logger.info(`Sent ${JSON.stringify(data)} to subscribers of topic ${sub}`);
            return true;
        } catch (error) {
            Logger.error(`Failed to send message to topic ${stringifySubscription(topic)} subscribers:  ${error}`);
            return false;
        }
    }

    /**
     * This function adds a user and a topic to the private collections.
     * If the topic is not present, it saves it considering that the source
     * of topic names is always the MessageBroker, and thus the only source
     * of truth of topic names.
     */
    registerUser(userId: string, sub: SubscriptionTopic) {
        let uid = this.usersUIDs.get(userId);
        if (uid) return { uid: uid, topicAddr: `${this.topicPrefix}.${stringifySubscription(sub)}` };
        uid = generateUID();
        this.usersUIDs.set(userId, uid);
        const topicSubs = this.subscriptionsToUID.get(JSON.stringify(sub)) ?? new Set();
        topicSubs.add(uid);
        this.subscriptionsToUID.set(JSON.stringify(sub), topicSubs);
        return { uid: uid, topicAddr: `${this.topicPrefix}.${stringifySubscription(sub)}` };
    }

    close() {
        Array.from(this.usersConnections.values()).forEach((conn) => conn.socket.disconnect(true));
        this.io.close();
    }
}

function createSocketNotificationCallback<T>(socketManager: SocketManager): NotificationCallback<T> {
    return async (_userIds, topic, notification) => {
        socketManager.sendToTopicSubscribers(topic, notification);
    };
}
export { createSocketNotificationCallback, SocketManager };
