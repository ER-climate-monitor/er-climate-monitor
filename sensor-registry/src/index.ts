import { createServer } from "./appUtils";

const URL: string = process.env.DB_URL || 'mongodb://localhost:27017/';
const PORT = process.env.PORT || 3000;


const app = createServer(URL);

app.listen(PORT, () => {
    console.log('Server is listening on port: ' + PORT);
});