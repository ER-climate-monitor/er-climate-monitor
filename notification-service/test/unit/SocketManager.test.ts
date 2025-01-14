import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { Server as HttpServer } from 'http';
import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import { createSocketNotificationCallback, SocketManager } from '../../src/socketManager';
import { AddressInfo } from 'net';
import { jest } from '@jest/globals';

describe('SocketManager - Unit tests', () => {
    let httpServer: HttpServer;
    let socketManager: SocketManager;
    let clientSocket: any;
    let port: number;

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
        test('should successfully register a new user', (done) => {
            const userId = 1;
            clientSocket.connect();
            clientSocket.on('connect', () => {
                clientSocket.emit('register', userId);
            });

            clientSocket.on('registered', (response: { success: boolean }) => {
                expect(response.success).toBeTruthy();
                done();
            });
        });

        test('should not allow multiple connections from same user', (done) => {
            const userId = 1;

            const secondConn = ClientIO(`http://localhost:${port}`, {
                transports: ['websocket'],
                autoConnect: false,
            });

            clientSocket.connect();
            clientSocket.on('connect', () => {
                clientSocket.emit('register', userId);
            });

            clientSocket.on('registered', () => {
                secondConn.connect();
                secondConn.on('connect', () => {
                    secondConn.emit('register', userId);
                });
            });

            secondConn.on('registered', (response: { success: boolean }) => {
                expect(response.success).toBeTruthy();
                expect(clientSocket.connected).toBeFalsy();
                secondConn.close();
                done();
            });
        });
    });

    describe('notification sending', () => {
        test('should successfully send notification to registered user', (done) => {
            const userId = 1;
            const testTopic = 'test-topic';
            const testData = { message: 'test message' };

            clientSocket.connect();
            clientSocket.on('connect', () => {
                clientSocket.emit('register', userId);
            });

            clientSocket.on('registered', async () => {
                const result = await socketManager.sendToUser(userId, testTopic, testData);
                expect(result).toBeTruthy();
            });

            clientSocket.on('notification', (data: any) => {
                expect(data.topic).toBe(testTopic);
                expect(data.data).toEqual(testData);
                done();
            });
        });

        test('should return false when sending to a non-registered user', async () => {
            const res = await socketManager.sendToUser(9999, 'test-topic', { data: "i'm not being sent!" });
            expect(res).toBeFalsy();
        });
    });

    describe('disconnection handling', () => {
        test('should properly clean up on user disconnect', (done) => {
            const userId = 1;
            clientSocket.connect();
            clientSocket.on('connect', () => {
                clientSocket.emit('register', userId);
            });

            clientSocket.on('registered', async () => {
                clientSocket.disconnect();

                setTimeout(async () => {
                    const res = await socketManager.sendToUser(userId, 'topic', { data: "i'm not being sent" });
                    expect(res).toBeFalsy();
                    done();
                }, 100);
            });
        });
    });

    describe('Create Socket Notification Callback', () => {
        test('should create callback properly', async () => {
            const userId = 1;
            const topic = 'test-topic';
            const notification = { messag: 'test' };

            const senToUserSpy = jest.spyOn(socketManager, 'sendToUser');
            senToUserSpy.mockResolvedValue(true);

            const callback = createSocketNotificationCallback(socketManager);
            await callback(userId, topic, notification);

            expect(senToUserSpy).toHaveBeenCalledWith(userId, topic, notification);
        });
    });
});
