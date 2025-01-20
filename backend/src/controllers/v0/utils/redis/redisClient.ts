import Redis from 'ioredis';

import dotenv from 'dotenv';
import { TokenValue } from '../../../../models/v0/tokenModel';
import { USER_ADMIN } from '../../../../models/v0/authentication/headers/authenticationHeaders';

dotenv.config();

class AuthenticationClient {
    private authenticationRedisClient: Redis;
    constructor() {
        this.authenticationRedisClient = new Redis(String(process.env.REDIS_URL));
    }

    public async setToken(token: string, tokenValue: TokenValue): Promise<void> {
        if (this.checkInput(token) && this.checkTokenValue(tokenValue)) {
            this.authenticationRedisClient.set(token, tokenValue.toJson());
        }
    }

    public async searchToken(token: string): Promise<string | null> {
        return this.authenticationRedisClient.get(token);
    }

    public async isExpired(token: string): Promise<boolean> {
        const result = await this.searchToken(token);
        if (result === null) {
            return false;
        }
        const expiration = TokenValue.fromJson(result).expiration;
        return new Date().getTime() < expiration.getTime();
    }

    public async isAdmin(token: string) {
        const result = await this.searchToken(token);
        if (result === null) {
            return false;
        }
        const role = TokenValue.fromJson(result).role;
        return role === USER_ADMIN;
    }

    private checkTokenValue(tokenValue: TokenValue) {
        return this.checkInput(tokenValue.email) && this.checkInput(tokenValue.expiration.getTime().toString()) && this.checkInput(tokenValue.role);
    }

    private checkInput(input: string): boolean {
        return input !== undefined && input.trim().length > 0 && input !== null;
    }
}

const authenticationRedisClient = new AuthenticationClient();

export { authenticationRedisClient };
