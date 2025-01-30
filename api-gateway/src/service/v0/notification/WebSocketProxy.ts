import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket } from 'socket.io-client';
import { Server as HttpServer } from 'http';
import Logger from 'js-logger';
import { NOTIFICATION_ENDPOINT } from '../../../models/v0/serviceModels';

Logger.useDefaults();

class WebSocketProxy {
    private serverSocket: SocketIOServer;
    private notificationSocket: ReturnType<typeof ClientSocket>;

    constructor(server: HttpServer) {
        this.serverSocket = new SocketIOServer(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        const serviceEndpoint = NOTIFICATION_ENDPOINT.replace('/v0', '');

        this.notificationSocket = ClientSocket(serviceEndpoint, {
            transports: ['websocket'],
        });

        this.setupServiceListeners();
        this.setupClientListeners();
    }

    private setupServiceListeners() {
        this.notificationSocket.on('connect', () => {
            Logger.info('Successfully connected to Notification Service!');
        });

        this.notificationSocket.on('disconnect', () => {
            Logger.info('Disconnected from Notification Service');
            this.notificationSocket.connect();
        });

        this.notificationSocket.onAny((event, ...args) => {
            Logger.info(`Forwarding message from Notification Service: ${event}`, args);
            this.serverSocket.emit(event, ...args);
        });
    }

    private setupClientListeners() {
        this.serverSocket.on('connection', (socket) => {
            Logger.info(`New client connection: ${socket.id}`);
            socket.on('register', (uid: string, topicAddr: string) => {
                this.notificationSocket.emit('register', uid, topicAddr);
                this.notificationSocket.once('registered', (result) => {
                    socket.emit('registered', result);
                });
            });

            socket.on('disconnect', () => {
                Logger.info(`Client disconnected ${socket.id}`);
            });
        });
    }

    close() {
        this.serverSocket.close();
        this.notificationSocket.close();
    }
}

export { WebSocketProxy };
