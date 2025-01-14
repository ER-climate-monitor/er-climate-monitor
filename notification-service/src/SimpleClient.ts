import { io as ClientIO, Socket } from 'socket.io-client';
import Logger from 'js-logger';
import axios from 'axios';

export class SimpleNotificationClient<M> {
    public GATEWAY_ENDPOINT = 'http://localhost:1926';
    public SERVICE_NAME = `temperature-service`;
    public SERVICE_NOTIFICATION_SUB_ENDPOINT = `${this.GATEWAY_ENDPOINT}/services/${this.SERVICE_NAME}/subscribe/notifications`;

    private incomingCallback: (_: M) => void;
    private clientSocket: Socket;

    constructor(url: string, incomingCallback: (_: M) => void) {
        this.incomingCallback = incomingCallback;
        this.clientSocket = ClientIO(url, {
            transports: ['websocket'],
            autoConnect: false,
        });
    }

    register(topic: string, serviceRegistrationEndpoint: string = this.SERVICE_NOTIFICATION_SUB_ENDPOINT) {
        axios
            .post(serviceRegistrationEndpoint, {}, {}) // TODO: insert as query parameter some auth. method for the API Gateway
            .then((res) => res.data)
            .then((subInfo: { uid: string; topicAddr: string }) => {
                this.clientSocket.connect();
                this.clientSocket.on('connect', () => {
                    this.clientSocket.emit('register', subInfo.uid, subInfo.topicAddr);
                });
                this.clientSocket.on('registered', (result: { success: boolean }) => {
                    if (!result.success) {
                        throw Error(`Something went wrong during subscritpion to: ${topic}`);
                    }
                    Logger.info('Successfully subscribed to topic: ' + topic);
                    this.clientSocket.on(subInfo.topicAddr, (res: M) => {
                        this.incomingCallback(res);
                    });
                });
            });
    }
}
