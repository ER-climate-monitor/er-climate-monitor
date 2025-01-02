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

function checkEmail(email: string): boolean { 
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return emailRegex.test(email);
}


export { checkUser, createUser, deleteOneUser, checkEmail }