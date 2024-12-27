import express, { Application } from 'express';
import dotenv from 'dotenv';
import { sensorRouter } from './routes/sensorRoutes';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 3000;

const URL: string = process.env.DB_URL || "";

export default function createServer(): Application {
    const app: Application = express();
    mongoose.connect(URL, { dbName: "sensor-database" });
    app.use(express.json());
    app.use("/sensor", sensorRouter);
    return app;
}

const app = createServer();

app.listen(PORT, () => {
    console.log("Server is listening...");
});