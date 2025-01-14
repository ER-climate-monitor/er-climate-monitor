import { NotificationCallback } from './messageBroker';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import Logger from 'js-logger';

Logger.useDefaults();

interface SocketConnection {
    socket: Socket;
    userId: number;
    lastConnected: Date;
}

/**
 * Mangaes client side notifications though a series of
 * web socket communications with this server.
 * From a server side perspective, this component is
 * implementing the callback needed when a new event is
 * pushed in the message broker inside the baackend
 * architecture.
 */
class SocketManager {
    private io: Server;
    private userSockets: Map<number, SocketConnection>;

    constructor(httpServer: HttpServer) {
        this.userSockets = new Map();
        this.io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.configureSocket();
    }

    private configureSocket(): void {
        this.io.on('connection', (socket: Socket) => {
            Logger.info(`New client connection: ${socket.id}`);
            socket.on('register', async (userId: number) => {
                try {
                    await this.registerUserSocket(userId, socket);
                    socket.emit('registered', { success: true });
                    Logger.info(`User ${userId} registerd with socketId: ${socket.id}`);
                } catch (error) {
                    socket.emit('registered', { success: false, error: (error as Error).message });
                    Logger.error(`Failed to register user ${userId}: ${error}`);
                }
            });

            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    private async registerUserSocket(userId: number, socket: Socket): Promise<void> {
        const existingConnection = this.userSockets.get(userId);
        if (existingConnection) {
            try {
                existingConnection.socket.disconnect(true);
            } catch (error) {
                Logger.warn(`Error disconnecting existing socket for user ${userId}: ${error}`);
            }
        }

        this.userSockets.set(userId, {
            socket,
            userId,
            lastConnected: new Date(),
        });

        socket.on('disconnect', () => {
            if (this.userSockets.get(userId)?.socket.id === socket.id) {
                this.userSockets.delete(userId);
                Logger.info(`User ${userId} disconnected and removed from socket registry.`);
            }
        });
    }

    private handleDisconnect(socket: Socket) {
        for (const [userId, connection] of this.userSockets.entries()) {
            if (connection.socket.id === socket.id) {
                this.userSockets.delete(userId);
                Logger.info(`User ${userId} successuflly disconnected and cleaned up.`);
            }
        }
    }

    async sendToUser<T>(userId: number, topic: string, data: T): Promise<boolean> {
        const connection = this.userSockets.get(userId);
        if (!connection) {
            Logger.warn(`No active connections found for user: ${userId}`);
            return false;
        }

        try {
            connection.socket.emit('notification', { topic, data });
            return true;
        } catch (error) {
            Logger.error(`Failed to send message to user ${userId}: ${error}`);
            return false;
        }
    }

    close() {
        Array.from(this.userSockets.values()).map((conn) => conn.socket.disconnect(true));
        this.io.close();
    }
}

function createSocketNotificationCallback<T>(socketManager: SocketManager): NotificationCallback<T> {
    return async (userId, topic, notification) => {
        if (!(await socketManager.sendToUser(userId, topic, notification))) {
            Logger.warn(`Notification to user ${userId} could not be delivered...`);
        }
    };
}

export { SocketManager, createSocketNotificationCallback };
