import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket } from 'socket.io-client';
import { Server as HttpServer } from 'http';
import Logger from 'js-logger';
import { DETECTION_SOCKET_ENDPOINT } from '../../../models/v0/serviceModels';

Logger.useDefaults();

class WebSocketProxy {
    private serverSocket: SocketIOServer;
    private detectionSocket: ReturnType<typeof ClientSocket>;

    constructor(server: HttpServer) {
        this.serverSocket = new SocketIOServer(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        this.detectionSocket = ClientSocket(DETECTION_SOCKET_ENDPOINT, {
            transports: ['websocket'],
        });

        this.setupServiceListeners();
        this.setupClientListeners();
    }

    private setupServiceListeners() {
        this.detectionSocket.on('connect', () => {
            Logger.info('Successfully connected to Detection Service!');
        });

        this.detectionSocket.on('disconnect', () => {
            Logger.info('Disconnected from Detection Service');
        });

        this.detectionSocket.onAny((event, ...args) => {
            Logger.info(`Forwarding message from Detection Service: ${event}`, args);
            this.serverSocket.emit(event, ...args);
        });
    }

    private setupClientListeners() {
        this.serverSocket.on('connection', (socket) => {
            Logger.info(`New client connection: ${socket.id}`);
            socket.on('subscribe', (uid: string, topicAddr: string) => {
                this.detectionSocket.emit('subscribe', uid, topicAddr);
            });

            socket.on('disconnect', () => {
                Logger.info(`Client disconnected ${socket.id}`);
            });
        });
    }

    close() {
        this.serverSocket.close();
    }
}

export { WebSocketProxy };
