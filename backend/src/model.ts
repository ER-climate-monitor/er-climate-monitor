import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const userModel = mongoose.model("Users", userSchema);
export { userModel }