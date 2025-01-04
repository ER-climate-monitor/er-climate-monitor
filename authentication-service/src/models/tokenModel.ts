interface IToken {
    token: string,
    expiration: Date
}

class Token implements IToken {
    token: string;
    expiration: Date;

    constructor(token: string, expiration: Date) {
        this.token = token;
        this.expiration = expiration;
    }
}

export { Token }