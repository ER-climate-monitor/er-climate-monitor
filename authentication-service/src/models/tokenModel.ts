import mongoose, { Model, Document, Date } from "mongoose"

interface IToken {
    token: string,
    email: string,
    expiration: Date
}

interface TokenDocument extends IToken, Document {}


const tokenSchema = new mongoose.Schema({
    token: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    expiration: {type: Date, required: true}
});

const tokenModel: Model<TokenDocument> = mongoose.model<TokenDocument>("Tokens", tokenSchema);
export { tokenModel, TokenDocument}