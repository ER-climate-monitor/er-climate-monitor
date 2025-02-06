import { Server, Socket } from 'socket.io';
import http from 'http';
import { DetectionDocument } from 'src/models/v0/detectionModel';

let io: Server;

export const setupSocketServer = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('subscribe', (sensorId: string) => {
            console.log(`Client ${socket.id} subscribed to sensor ${sensorId}`);
            socket.join(sensorId);
        });

        socket.on('unsubscribe', (sensorId: string) => {
            console.log(`Client ${socket.id} unsubscribed from sensor ${sensorId}`);
            socket.leave(sensorId);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const sendMessageToSubscribers = (sensorId: string, detection: DetectionDocument) => {
    if (!io) {
        console.error('Socket server is not initialized.');
        return;
    }

    io.to(sensorId).emit('new-detection', detection);
};
