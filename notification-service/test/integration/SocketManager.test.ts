// test/integration/SocketManager.test.ts
import { test, expect, describe, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { SocketManager } from '../../src/socketManager';
import { IntegrationTestBase } from '../helpers/TestBase';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';

describe('SocketManager - Integration Tests', () => {
    let port: number;
    let httpServer: HttpServer;
    let socketManager: SocketManager;
    let testBase: IntegrationTestBase;

    beforeAll(async () => {
        testBase = new (class extends IntegrationTestBase {})();
    });

    beforeEach(() => {
        httpServer = createServer().listen();
        const address = httpServer.address() as AddressInfo;
        port = address.port;
        socketManager = new SocketManager(httpServer);
    });

    afterAll(async () => {
        await testBase.cleanupClients();
    });

    afterEach(async () => {
        socketManager.close();
        httpServer.close();
    });

    test('should handle complete message flow', async () => {
        const receivedMessages: any[] = [];
        const clients = await testBase.setupClients(2, port);

        clients.forEach((client) => {
            client.socket.on('notification', (message) => {
                receivedMessages.push({ userId: client.userId, message });
            });
        });

        const testMessage = { type: 'test', content: 'hello' };
        await socketManager.sendToUser(1, 'notification', testMessage);
        await socketManager.sendToUser(2, 'notification', testMessage);

        await testBase.waitForMessages();

        expect(receivedMessages).toHaveLength(2);
        expect(receivedMessages).toContainEqual({
            userId: 1,
            message: {
                data: testMessage,
                topic: 'notification',
            },
        });
        expect(receivedMessages).toContainEqual({
            userId: 2,
            message: {
                data: testMessage,
                topic: 'notification',
            },
        });
    });
});
