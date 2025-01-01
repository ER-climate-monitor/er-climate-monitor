import { userModel } from "../../models/userModel";
import { jwtSecretKey } from "../userController";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();


async function createToken(inputEmail: string): Promise<string> {
    const EXPIRATION = process.env.EXPIRATION || "1h";
    const user = await userModel.findOne({email: inputEmail});
    const data = { time: Date(), userId: user?.id,};
    const token = jwt.sign(data, jwtSecretKey, {expiresIn: EXPIRATION});
    return token;
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