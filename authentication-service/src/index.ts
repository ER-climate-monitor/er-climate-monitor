import { createProdServer } from './appUtils';

const PORT = process.env.PORT || 3000;
const URL: string = process.env.DB_URL || "mongodb+srv://matteoiorio01:bsHMrwnluMpMptJY@cluster0.tj3ou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = createProdServer(URL);

app.listen(PORT, () => {
    console.log('listening', PORT);
});
