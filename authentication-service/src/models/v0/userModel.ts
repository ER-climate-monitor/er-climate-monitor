import mongoose, { Model, Document } from 'mongoose';

interface IUser {
    email: string;
    password: string;
    role: string;
}

interface UserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
});

const userModel: Model<UserDocument> = mongoose.model<UserDocument>('Users', userSchema);
export { userModel, UserDocument };
