import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { Server as HttpServer } from 'http';
import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import { SocketManager } from '../../src/components/pluggable/socketManager';
import { AddressInfo } from 'net';
import Logger from 'js-logger';
import { SubscriptionTopic } from '../../src/model/notificationModel';

Logger.useDefaults();

describe('SocketManager - Unit tests', () => {
    let httpServer: HttpServer;
    let socketManager: SocketManager;
    let clientSocket: any;
    let port: number;

    const testTopic = 'test-topic';
    const testQuery = 'test-query';

    const testSub: SubscriptionTopic = {
        topic: testTopic,
        query: testQuery,
    };

    const notificationPrefix = 'notification';

    beforeEach((done) => {
        httpServer = createServer().listen();
        const address = httpServer.address() as AddressInfo;
        port = address.port;

        socketManager = new SocketManager(httpServer, notificationPrefix);
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
            const userId = 'user-123';
            const subInfo = socketManager.registerUser(userId, testSub);
            clientSocket.connect();

            clientSocket.on('connect', () => {
                clientSocket.emit('register', subInfo.uid, subInfo.topicAddr);
            });

            clientSocket.on('registered', (result: { success: boolean }) => {
                expect(result.success).toBeTruthy();
                done();
            });
        }, 2000);
    });

    describe('topic subscription messages', () => {
        test('should send messages to user subscribed to topic', (done) => {
            const userId = 'user-123';
            const subInfo = socketManager.registerUser(userId, testSub);
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
                const sub: SubscriptionTopic = {
                    topic: testTopic,
                    query: testQuery,
                };
                socketManager.sendToTopicSubscribers(sub, msg);
            });
        }, 2000);

        test('should support wildcard subscriptions', () => {
            const userId = 'user-123';
            const sensorName = 'eeeee';
            const topicOnlySub: SubscriptionTopic = { topic: testTopic };
            const topicQuerySub: SubscriptionTopic = { topic: testTopic, query: testQuery };
            const topicSensorSub: SubscriptionTopic = { topic: testTopic, sensorName: sensorName };
            const fullTopicSub: SubscriptionTopic = { topic: testTopic, query: testQuery, sensorName: sensorName };

            const subInfo1 = socketManager.registerUser(userId, topicOnlySub);
            const subInfo2 = socketManager.registerUser(userId, topicQuerySub);
            const subInfo3 = socketManager.registerUser(userId, topicSensorSub);
            const subInfo4 = socketManager.registerUser(userId, fullTopicSub);

            expect(subInfo1.topicAddr).toEqual(`notification.${testTopic}.#`);
            expect(subInfo2.topicAddr).toEqual(`notification.${testTopic}.*.${testQuery}`);
            expect(subInfo3.topicAddr).toEqual(`notification.${testTopic}.${sensorName}.#`);
            expect(subInfo4.topicAddr).toEqual(`notification.${testTopic}.${sensorName}.${testQuery}`);
        });
    });
});
