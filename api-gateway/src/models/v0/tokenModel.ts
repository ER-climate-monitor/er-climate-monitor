interface ITokenValue {
    email: string;
    role: string;
    expiration: number;
}

class TokenValue implements ITokenValue {
    email: string;
    role: string;
    expiration: number;

    constructor(email: string, role: string, expiration: number) {
        this.email = email;
        this.role = role;
        this.expiration = expiration;
    }

    toJson(): string {
        const body = {
            email: this.email,
            role: this.role,
            expiration: this.expiration,
        };
        return JSON.stringify(body);
    }

    static fromJson(jsonString: string): TokenValue {
        const data = JSON.parse(jsonString);
        return new TokenValue(data.email, data.role, data.expiration);
    }
}

export { TokenValue };
