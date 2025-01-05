import { UserDocument, userModel } from "../../models/userModel";
import { jwtSecretKey } from "../userController";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import dotenv from 'dotenv';
import { Token } from "../../models/tokenModel";

dotenv.config();

async function createToken(inputEmail: string): Promise<Token> {
    const EXPIRATION = process.env.EXPIRATION || "1h";
    const data = { userEmail:inputEmail,};
    const token = jwt.sign(data, jwtSecretKey, {expiresIn: EXPIRATION});
    const infos: JwtPayload= jwtDecode<JwtPayload>(token);
    return new Token(token, new Date((infos.exp || 0) * 1000));
}

function verifyToken(token: string): Boolean {
    try { 
        const verified  = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return true
        }
        return false
    }
    catch(error) {
        if (error instanceof jwt.TokenExpiredError) {
            return false;
        }
        throw error;
    }
};

export { createToken, verifyToken }