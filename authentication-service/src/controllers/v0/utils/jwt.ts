import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import dotenv from 'dotenv';
import { Token } from '../../../models/v0/tokenModel';
import { userModel } from '../../../models/v0/userModel';
import { checkUserById } from './userUtils';

dotenv.config();

const jwtSecretKey: jwt.Secret = String(process.env.JWT_SECRET_KEY) || 'somesecret';

function decodeToken(token: string): JwtPayload {
    return jwtDecode(token);
}

function tokenExpiration(token: string): Date {
    const infos = decodeToken(token);
    return new Date((infos.exp || 0) * 1000);
}

function getInfosFromToken(token: string): Token {
    const infos = decodeToken(token);
    return new Token(token, infos.userEmail, infos.userRole, tokenExpiration(token));
}

async function createToken(inputEmail: string, role: string): Promise<Token> {
    const EXPIRATION: any = String(process.env.EXPIRATION) || '1h';
    const user = await userModel.findOne({ email: inputEmail });
    if (user == null) {
        throw new Error('The input user is not registered.');
    }
    const data = { userId: user.id, userEmail: inputEmail, userRole: role };
    const token = jwt.sign(data, jwtSecretKey, { expiresIn: EXPIRATION });
    return new Token(token, inputEmail, role, new Date(tokenExpiration(token)));
}

async function verifyToken(token: string): Promise<Boolean> {
    try {
        const verified = jwt.verify(token, jwtSecretKey);
        const id = decodeToken(token).userId;
        const exists = await checkUserById(id);
        return verified && id && exists;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return false;
        }
        throw error;
    }
}

export { createToken, verifyToken, tokenExpiration, getInfosFromToken };
