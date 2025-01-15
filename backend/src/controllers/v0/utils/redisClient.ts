import { createClient } from "redis";

const options = {
    url: process.env.REDIS_URL
}

const authenticationRedisClient = createClient(options);

export { authenticationRedisClient }