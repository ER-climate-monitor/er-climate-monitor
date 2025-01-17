import Redis from 'ioredis';

import dotenv from 'dotenv';

dotenv.config();

class AuthenticationClient {
    authenticationRedisClient: Redis;
    constructor() {
        this.authenticationRedisClient = new Redis(String(process.env.REDIS_URL));
    }

    public async setToken(token: string, expiration: string): Promise<void> {
        if (this.checkInput(token) && this.checkInput(expiration)) {
            this.authenticationRedisClient.set(token, String(expiration));
        }
    }

    public async searchToken(token: string): Promise<string | null> {
        return this.authenticationRedisClient.get(token);
    }

    private checkInput(input: string): boolean {
        return input !== undefined && input.trim().length > 0;
    }
}

const authenticationRedisClient = new AuthenticationClient();

export { authenticationRedisClient };
