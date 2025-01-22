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
    isAdminAndNotExpired(token: string): Promise<boolean>;
    deleteToken(token: string): void;
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
        const expired = this.checkExpirationDate(result.expiration);
        if (expired) {
            this.deleteToken(token);
        }
        return expired;
    }

    public async deleteToken(token: string) {
        this.authenticationRedisClient.unlink(token); 
    }

    public async isAdmin(token: string) {
        const result = await this.searchToken(token);
        if (result === null) {
            return false;
        }
        return this.checkTokenRole(result.role, USER_ADMIN.toLowerCase());
    }

    public async isAdminAndNotExpired(token: string): Promise<boolean> {
        const result = await this.searchToken(token);
        if (result === null) {
            return false;
        }
        return this.checkTokenRole(result.role, USER_ADMIN.toLowerCase()) && this.checkExpirationDate(result.expiration);
    }

    public checkTokenRole(tokenRole: string, role: string) {
        return tokenRole.toLowerCase() === role.toLowerCase();
    }

    private checkExpirationDate(expiration: number) {
        return new Date().getTime() >= expiration;
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
