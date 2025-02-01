import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { router } from './notificationRoutes';
import Logger from 'js-logger';
import { SocketManager, createSocketNotificationCallback } from './components/pluggable/socketManager';
import { config } from 'dotenv';
import { DetectionBroker } from './components/detectionBroker';
import { setMessageBroker, setSocketManger } from './handlers/notificationHttpHandler';
import { DetectionEvent } from './model/notificationModel';
import mongoose from 'mongoose';
import { createDbCallback } from './model/dbCallback';
import { getAllSubscriptions } from './model/notificationOperations';

config();
Logger.useDefaults();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 4444;
const host = process.env.HOST || 'localhost';

const messageBroker = new DetectionBroker<DetectionEvent>();
const socketManager = new SocketManager(server);

messageBroker.connect().then(async () => {
    const subs = await getAllSubscriptions();
    messageBroker.restoreUserSubscriptions(subs);
});

messageBroker.addNotificationCallback(createSocketNotificationCallback(socketManager));
messageBroker.addNotificationCallback(createDbCallback());

const dbUrl = process.env.DB_URL || 'mongodb://localhost';
const dbName = process.env.DB_NAME || 'notifications-database';
mongoose
    .connect(dbUrl, { dbName: dbName })
    .then((_) => Logger.info('✅ Succesfully connected to Mongo Database!'))
    .catch((error) => {
        Logger.error('An error occurred during mongo connections: ', error);
        messageBroker.close().then(() => {
            socketManager.close();
            server.close();
        });
    });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

setMessageBroker(messageBroker);
setSocketManger(socketManager);

app.use('/v0/alert', router);
server.listen(4444, () => Logger.log(`Server listening on http://${host}:${port}`));
