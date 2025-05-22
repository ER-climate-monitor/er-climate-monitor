import mongoose from 'mongoose';
import createServer from './server';
import dotenv from 'dotenv';
import { detectionPublisher } from './controllers/v0/utils/brokerClient';
import Logger from 'js-logger';
import http from 'http';
import { setupSocketServer } from './sockets/socket';
import SwaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';

async function startServer() {
    try {
        dotenv.config();
        await mongoose.connect(DB_URL, { dbName: 'detections-database', autoIndex: false });
        console.log('Connected to MongoDB');

        await detectionPublisher.connect();
        console.log('Connected to Notification Event Broker!');

        Logger.useDefaults();
        const app = createServer();
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });

        const file: string = fs.readFileSync('src/doc/openapi/swagger.yaml', 'utf8');
        const swaggerDocument = YAML.parse(file);
        app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDocument));

        const server = http.createServer(app);
        setupSocketServer(server);
        server.listen(8081);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

startServer();
