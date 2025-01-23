import { createProdServer } from "./appUtils";

const PORT = process.env.PORT || 3000;
const URL: string = process.env.DB_URL || 'mongodb://localhost:27017';

const app = createProdServer(URL);

app.listen(PORT, () => {
    console.log('listening', PORT);
});