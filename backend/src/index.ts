import express from 'express';
import dotenv from 'dotenv';
import { BASE_PATH_V0 } from './routes/v0/paths/gatewayPaths';
import { gatewayRouter } from './routes/v0/gatewayRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get(BASE_PATH_V0, (_, res) => {
    res.send(`Running in ${process.env.NODE_ENV} mode`);
});

app.use(BASE_PATH_V0, gatewayRouter)

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
