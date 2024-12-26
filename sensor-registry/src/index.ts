import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_, res) => {
    res.send(`Running in ${process.env.NODE_ENV} mode`);
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
