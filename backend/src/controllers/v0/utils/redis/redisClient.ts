import Redis from "ioredis"

import dotenv from 'dotenv';

dotenv.config();

class AuthenticationClient {
    authenticationRedisClient: any
    constructor() {
        this.authenticationRedisClient = new Redis(String(process.env.REDIS_URL));
    }

    public async setToken(token: string, expiration: string) {
        if (this.checkInput(token) && this.checkInput(expiration)) {
            this.authenticationRedisClient.set(token, String(expiration));
        }
    }

    private checkInput(input: string): boolean {
        return input !== undefined && input.trim().length > 0;
    }
}

const authenticationRedisClient = new AuthenticationClient();

export { authenticationRedisClient }