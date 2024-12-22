import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRouter';
import mongoose from "mongoose"
import { healthRouter } from './routes/healthRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL: string = process.env.DB_URL || "";
mongoose.connect(URL, { dbName: "authorization-database" });

app.use(express.json());

app.use("/health", healthRouter);
app.use("/user", userRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
