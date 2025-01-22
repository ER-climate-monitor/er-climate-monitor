import Redis from 'ioredis';

import dotenv from 'dotenv';
import { TokenValue } from '../../../../models/v0/tokenModel';
import { USER_ADMIN } from '../../../../models/v0/authentication/headers/authenticationHeaders';

dotenv.config();

interface IAuthenticationClient {
    setToken(token: string, tokenValue: TokenValue): Promise<void>;
    searchToken(token: string): Promise<TokenValue | null>;
    isExpired(token: string): Promise<boolean>;
    isAdmin(token: string): Promise<boolean>;
}

class AuthenticationClient implements IAuthenticationClient {
    private authenticationRedisClient: Redis;
    constructor() {
        this.authenticationRedisClient = new Redis(String(process.env.REDIS_URL));
    }

    public async setToken(token: string, tokenValue: TokenValue): Promise<void> {
        if (this.checkInput(token) && this.checkTokenValue(tokenValue)) {
            this.authenticationRedisClient.set(token, tokenValue.toJson());
        }
    }

    public async searchToken(token: string): Promise<TokenValue | null> {
        const result = await this.authenticationRedisClient.get(token);
        if (result === null) {
            return null;
        }
        return TokenValue.fromJson(result);
    }

    public async isExpired(token: string): Promise<boolean> {
        const result = await this.searchToken(token);
        if (result === null) {
            return true;
        }
        return new Date().getTime() >= result.expiration;
    }

    public async isAdmin(token: string) {
        const result = await this.searchToken(token);
        if (result === null) {
            return false;
        }
        return result.role.toLowerCase() === USER_ADMIN.toLowerCase();
    }

    private checkTokenValue(tokenValue: TokenValue) {
        return (
            this.checkInput(tokenValue.email) &&
            this.checkInput(tokenValue.expiration.toString()) &&
            this.checkInput(tokenValue.role)
        );
    }

    private checkInput(input: string): boolean {
        return input !== undefined && input.trim().length > 0 && input !== null;
    }
}

const authenticationRedisClient = new AuthenticationClient();

export { authenticationRedisClient, IAuthenticationClient };
