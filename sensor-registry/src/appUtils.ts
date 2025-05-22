import express, { Application } from 'express';
import dotenv from 'dotenv';
import { sensorRouter } from './routes/v0/sensorRoutes';
import mongoose from 'mongoose';
import { BASE_SENSOR_PATH_V0 } from './routes/v0/paths/sensorPaths';
import SwaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

dotenv.config();

function createServer(url: string): Application {
    const app: Application = express();
    mongoose.connect(url, { dbName: 'sensor-database' });
    app.use(express.json());
    app.use(BASE_SENSOR_PATH_V0, sensorRouter);
    if (!process.env.CI || process.env.CI == 'False') {
        const file: string = fs.readFileSync('src/doc/openapi/swagger.yaml', 'utf8');
        const swaggerDocument = YAML.parse(file);
        app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDocument));
    }
    return app;
}

async function dropTestDatabase(url: string) {
    mongoose.connect(url, { dbName: 'sensor-database' }).then((mongodb) => {
        mongodb.connection.dropDatabase();
    });
}

export { createServer, dropTestDatabase };
