import Redis from 'ioredis';

import dotenv from 'dotenv';
import { TokenValue } from '../../../../models/v0/tokenModel';
import { USER_ADMIN } from '../../../../models/v0/authentication/headers/authenticationHeaders';

dotenv.config();

/**
 * Interface that is used for saving, searching, deleting and validating the input authentication token.
 */
interface AuthenticationClient {
    /**
     * Save the input token using a specific technology.
     * @param {string} token - Input token returned from the authentication service.
     * @param {string} tokenValue - Different information linked to the input token.
     */
    setToken(token: string, tokenValue: TokenValue): Promise<void>;
    /**
     * Search the input token.
     * @param {string} token - Input token given by the user.
     * @returns {Promise<TokenValue | null>} A promise with the Token value if the input token is found otherwise the promise will contains the value null.
     */
    searchToken(token: string): Promise<TokenValue | null>;
    /**
     * Search and check if the input token is expired.
     * @param {string} token - Input token given by the user.
     * @returns {Promise<boolean>} If the token is found the system checks if It is still valid otherwise It will return false even if the token is not found.
     */
    isExpired(token: string): Promise<boolean>;
    /**
     * Check if the input token is linked to an Admin.
     * @param {string} token - Input token given by the user.
     * @returns {Promise<boolean>} True if the token is linked to an Admin otherwise It will return false.
     */
    isAdmin(token: string): Promise<boolean>;
    /**
     * Check if the input token is linked to an Admin and If it has not expired yet.
     * @param {string} token - Input token given by the user.
     * @returns {Promise<boolean>} True if the user is an Admin and also his token is not expired, otherwise It will return false.
     */
    isAdminAndNotExpired(token: string): Promise<boolean>;
    /**
     * Delete the input token from the collection.
     * @param {string} token - Input token.
     */
    deleteToken(token: string): void;
}

/**
 * Class that uses Redis as technology for storing all the different tokens.
 */
class RedisAuthenticationClient implements AuthenticationClient {
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
        const expired = this.checkIsExpired(result.expiration);
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
        return this.checkTokenRole(result.role, USER_ADMIN.toLowerCase()) && !this.checkIsExpired(result.expiration);
    }

    public checkTokenRole(tokenRole: string, role: string) {
        return tokenRole.toLowerCase() === role.toLowerCase();
    }

    private checkIsExpired(expiration: number) {
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

const authenticationRedisClient = new RedisAuthenticationClient();

export { authenticationRedisClient, RedisAuthenticationClient, AuthenticationClient };
