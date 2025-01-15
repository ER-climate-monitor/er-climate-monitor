import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { router, setMessageBroker, setSocketManger } from './routes/notificationRoutes';
import Logger from 'js-logger';
import path from 'path';
import { MessageBroker } from './messageBroker';
import { SocketManager, createSocketNotificationCallback } from './socketManager';

Logger.useDefaults();

const app = express();
const server = createServer(app);
const port = 4444;

const messageBroker = new MessageBroker<string>();
const socketManager = new SocketManager(server);
messageBroker.connect();

messageBroker.setNotificationCallback(createSocketNotificationCallback(socketManager));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.get('/', (_: Request, res: Response) => res.sendFile(path.join(__dirname, 'index.html')));

setMessageBroker(messageBroker);
setSocketManger(socketManager);

app.use('/topics', router);

server.listen(4444, () => Logger.log(`Server listening on http://localhost:${port}`));
