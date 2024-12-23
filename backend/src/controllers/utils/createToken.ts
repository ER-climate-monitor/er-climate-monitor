import { userModel } from "../../models/userModel";
import { jwtSecretKey } from "../userController";
import jwt from "jsonwebtoken";



async function createToken(inputEmail: String): Promise<string> {
    const user = await userModel.findOne({email: inputEmail});
    const data = { time: Date(), userId: user?.id,};
    const token = jwt.sign(data, jwtSecretKey);
    return token;
}

export { createToken }