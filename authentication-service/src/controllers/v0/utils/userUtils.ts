import { UserDocument, userModel } from '../../../models/v0/userModel';
import bcrypt from 'bcrypt';
import { DeleteResult, ObjectId } from 'mongoose';
import mongoSanitize from 'mongo-sanitize';
import { ADMIN_USER } from '../../../models/v0/headers/userHeaders';

const saltRounds = Number(process.env.saltRounds) || 10;

async function checkUser(inputEmail: string): Promise<boolean> {
    const existingUser = await userModel.exists({ email: inputEmail });
    return existingUser !== null;
}

async function isUserRoleAdmin(inputEmail: string): Promise<boolean> {
    const user = await userModel.findOne({ email: inputEmail });
    if (user === null) {
        return false;
    }
    return user.role === ADMIN_USER;
}

async function checkUserById(id: ObjectId): Promise<boolean> {
    return (await userModel.findById(id)) !== null;
}

async function createUser(inputEmail: string, password: string, role: string): Promise<UserDocument> {
    const hash: string = await bcrypt.hash(password, saltRounds);
    const newUser: UserDocument = new userModel({ email: inputEmail, password: hash, role: role });
    await newUser.save();
    return newUser;
}
async function deleteOneUser(email: string): Promise<boolean> {
    const status: DeleteResult = await userModel.deleteOne({ email: email });
    return status.deletedCount === 1;
}

function checkEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = mongoSanitize<string>(email);
    return emailRegex.test(sanitizedEmail);
}

function checkPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

export { checkUser, checkUserById, createUser, deleteOneUser, checkEmail, checkPassword, isUserRoleAdmin };
