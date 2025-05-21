import express, { Application } from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/v0/userRouter';
import { healthRouter } from './routes/v0/healthRouter';
import mongoose from 'mongoose';
import SwaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

dotenv.config();

const PORT = process.env.PORT || 3000;

function configureServer() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    if (!process.env.CI || process.env.CI == 'False') {
        const file: string = fs.readFileSync('src/doc/openapi/swagger.yaml', 'utf8');
        const swaggerDocument = YAML.parse(file);
        app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDocument));
    }

    app.use('/v0/health', healthRouter);
    app.use('/v0/user', userRouter);
    return app;
}

function createProdServer(url: string) {
    mongoose.connect(url, { dbName: 'authorization-database' });
    return configureServer();
}

function createTestServer(inputMongoURL: string): Application {
    mongoose.connect(inputMongoURL, { dbName: 'authorization-database' });
    return configureServer();
}

async function dropTestDatabase(inputMongoURL: string) {
    mongoose.connect(inputMongoURL, { dbName: 'authorization-database' }).then((mongodb) => {
        mongodb.connection.dropDatabase();
    });
}

export { createProdServer, createTestServer, dropTestDatabase };
