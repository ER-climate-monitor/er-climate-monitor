import express, { Application } from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRouter';
import mongoose from "mongoose"
import { healthRouter } from './routes/healthRouter';

dotenv.config();

const PORT = process.env.PORT || 3000;

export default function createServer(): Application {
    const app = express();
    const URL: string = process.env.DB_URL || "";
    mongoose.connect(URL, { dbName: "authorization-database" });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/health", healthRouter);
    app.use("/user", userRouter);
    return app;
}