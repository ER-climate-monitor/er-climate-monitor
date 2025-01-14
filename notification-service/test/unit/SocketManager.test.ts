import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { Server as HttpServer } from 'http';
import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import { SocketManager } from '../../src/socketManager';
import { AddressInfo } from 'net';
import Logger from 'js-logger';

Logger.useDefaults();

describe('SocketManager - Unit tests', () => {
    let httpServer: HttpServer;
    let socketManager: SocketManager;
    let clientSocket: any;
    let port: number;
    const testTopic = 'test-topic';
    const notificationPrefix = 'notification';

    beforeEach((done) => {
        httpServer = createServer().listen();
        const address = httpServer.address() as AddressInfo;
        port = address.port;

        socketManager = new SocketManager(httpServer);
        clientSocket = ClientIO(`http://localhost:${port}`, {
            transports: ['websocket'],
            autoConnect: false,
        });
        done();
    });

    afterEach(() => {
        socketManager.close();
        clientSocket.close();
        httpServer.close();
    });

    describe('connection and registration', () => {
        test('should not permit subscription to not subscribed users', (done) => {
            clientSocket.connect();
            clientSocket.on('connect', () => {
                clientSocket.emit('register', 'aaaaaa', 'eeeeee');
            });

            clientSocket.on('registered', (result: { success: boolean; error: string }) => {
                expect(result.success).toBeFalsy();
                done();
            });
        });

        test('should successfully let a user to be registered', (done) => {
            const userId = 1;
            const subInfo = socketManager.registerUser(userId, testTopic);
            clientSocket.connect();

            clientSocket.on('connect', () => {
                clientSocket.emit('register', subInfo.uid, subInfo.topicAddr);
            });

            clientSocket.on('registered', (result: { success: boolean }) => {
                expect(result.success).toBeTruthy();
                done();
            });
        });
    });

    describe('topic subscription messages', () => {
        test('should send messages to user subscribed to topic', (done) => {
            const userId = 1;
            const subInfo = socketManager.registerUser(userId, testTopic);
            clientSocket.connect();

            clientSocket.on('connect', () => {
                clientSocket.emit('register', subInfo.uid, subInfo.topicAddr);
            });

            clientSocket.on('registered', (_: { success: boolean }) => {
                const msg = { data: 'okeee' };
                clientSocket.on(subInfo.topicAddr, (res: { data: string }) => {
                    expect(res.data).toBe(msg.data);
                    done();
                });
                socketManager.sendToTopicSubscribers(testTopic, msg, notificationPrefix);
            });
        }, 2000);
    });
});
