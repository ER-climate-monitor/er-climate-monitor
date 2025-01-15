import { createClient } from "redis";

const options = {
    url: process.env.REDIS_URL
}

class AuthenticationClient {
    authenticationRedisClient: any
    constructor(options: {}) {
        this.authenticationRedisClient = createClient(options);
    }

    public async setToken(token: string, expiration: number | string) {
        this.authenticationRedisClient.set
    }
}

const authenticationRedisClient = new AuthenticationClient(options);

export { authenticationRedisClient }