interface IToken {
    token: string;
    email: string;
    role: string;
    expiration: Date;
}

class Token implements IToken {
    token: string;
    email: string;
    role: string;
    expiration: Date;

    constructor(token: string, email: string, role: string, expiration: Date) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.expiration = expiration;
    }
}

export { Token };
