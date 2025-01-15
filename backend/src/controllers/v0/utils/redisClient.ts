import { createClient } from "redis";

const options = {
    url: process.env.REDIS_URL
}

class AuthenticationClient {
    authenticationRedisClient: any
    constructor(options: {}) {
        this.authenticationRedisClient = createClient(options);
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

const authenticationRedisClient = new AuthenticationClient(options);

export { authenticationRedisClient }