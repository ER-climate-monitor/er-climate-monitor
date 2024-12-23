import { UserDocument, userModel } from "../../models/userModel";
import { saltRounds } from "../userController";
import bcrypt from "bcrypt";
import { DeleteResult } from "mongoose";

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
async function deleteOneUser(email:string): Promise<boolean> {
    const status: DeleteResult = await userModel.deleteOne({email: email});
    return status.deletedCount === 1
}


export { checkUser, createUser, deleteOneUser }