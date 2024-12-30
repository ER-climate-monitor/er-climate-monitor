import { userModel } from "../../models/userModel";
import { jwtSecretKey } from "../userController";
import jwt from "jsonwebtoken";

const EXPIRATION = String(process.env.EXPIRATION) || "1h";

async function createToken(inputEmail: string): Promise<string> {
    const user = await userModel.findOne({email: inputEmail});
    const data = { time: Date(), userId: user?.id,};
    const token = jwt.sign(data, jwtSecretKey, {expiresIn: EXPIRATION});
    return token;
}

function verifyToken(token: string): Boolean {
    const verified  = jwt.verify(token, jwtSecretKey);
    if (verified) {
        return true
    }
    return false
};

export { createToken, verifyToken }