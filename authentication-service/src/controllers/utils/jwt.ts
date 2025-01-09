import { jwtSecretKey } from "../userController";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import dotenv from 'dotenv';
import { Token } from "../../models/tokenModel";
import { userModel } from "../../models/userModel";
import { checkUser, checkUserById } from "./userUtils";

dotenv.config();

function decodeToken(token: string): JwtPayload { 
    return jwtDecode(token);
}

function tokenExpiration(token: string): Date {
    const infos = decodeToken(token);
    return new Date((infos.exp || 0) * 1000);
}


async function createToken(inputEmail: string): Promise<Token> {
    const EXPIRATION = process.env.EXPIRATION || "1h";
    const user = await userModel.findOne({email: inputEmail});
    if (user == null) {
        throw new Error("The input user is not registered.");
    }
    const data = { userId: user.id};
    const token = jwt.sign(data, jwtSecretKey, {expiresIn: EXPIRATION});
    return new Token(token, new Date(tokenExpiration(token)));
}

async function verifyToken(token: string): Promise<Boolean> {
    try  {
        const verified = jwt.verify(token, jwtSecretKey);
        const id = decodeToken(token).userId;
        const exists = await checkUserById(id);
        if (verified && id && exists) {
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

export { createToken, verifyToken, tokenExpiration }