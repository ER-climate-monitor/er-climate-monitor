import express from 'express';
import dotenv from 'dotenv';
import { sensorRouter } from './routes/sensorRoutes';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const URL: string = process.env.DB_URL || "";
mongoose.connect(URL, { dbName: "sensor-database" });

app.use(express.json());

app.use("/sensor", sensorRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
