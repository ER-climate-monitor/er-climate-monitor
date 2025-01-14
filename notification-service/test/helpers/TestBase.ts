import { io, Socket } from 'socket.io-client';

export interface TestClient {
    socket: Socket;
    userId: number;
}

export abstract class IntegrationTestBase {
    protected clients: TestClient[] = [];

    async setupClients(numClients: number, port: number): Promise<TestClient[]> {
        for (let i = 0; i < numClients; i++) {
            const socket = io(`http://localhost:${port}`);
            const userId = i + 1;

            await new Promise<void>((resolve) => {
                socket.on('connect', () => {
                    socket.emit('register', userId);
                    socket.on('registered', () => resolve());
                });
            });
            this.clients.push({ socket, userId });
        }

        return this.clients;
    }

    cleanupClients() {
        this.clients.forEach((client) => client.socket.close());
        this.clients = [];
    }

    async waitForMessages(timeout: number = 1000): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, timeout));
    }
}
