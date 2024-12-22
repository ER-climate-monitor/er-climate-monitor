import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './router';
import mongoose from "mongoose"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL: string = process.env.DB_URL || "";
mongoose.connect(URL, { dbName: "authorization-database" });

app.use(express.json());

app.get('/', (_, res) => {
    res.send(`Running in ${process.env.NODE_ENV} mode`);
});

app.use("/user", userRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
