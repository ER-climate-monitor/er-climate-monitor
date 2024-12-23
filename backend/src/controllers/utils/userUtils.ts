import { UserDocument, userModel } from "../../models/userModel";
import { saltRounds } from "../userController";
import bcrypt from "bcrypt";


async function checkUser(inputEmail: String): Promise<Boolean> {
    const existingUser: Boolean = await userModel.findOne({email: inputEmail}) || false;
    return existingUser
}

async function createUser(inputEmail: string, password: string, role: string): Promise<UserDocument> {
    const hash: string = await bcrypt.hash(password, saltRounds);
    const newUser: UserDocument = new userModel({email: inputEmail, password: hash, role: role});
    newUser.save();
    return newUser
}


export { checkUser, createUser }