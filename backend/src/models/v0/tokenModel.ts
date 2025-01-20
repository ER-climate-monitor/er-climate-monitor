interface ITokenValue {
    email: string,
    role: string,
    expiration: Date
}

class TokenValue implements ITokenValue {
    email: string;
    role: string;
    expiration: Date;

    constructor(email: string, role: string, expiration: Date) {
        this.email = email;
        this.role = role;
        this.expiration = expiration;
    }

    toJson(): string { 
        const body = {
            email: this.email,
            role: this.role,
            expiration: this.expiration
        }
        return JSON.stringify(body);
    }

    static fromJson(jsonString: string): TokenValue {
        const data = JSON.parse(jsonString);
        return new TokenValue(
            data.email,
            data.role,
            new Date(data.expiration) 
        );
    }
}

export { TokenValue }