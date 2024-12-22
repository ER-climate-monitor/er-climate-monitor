import express from "express";
import { registerUser, loginUser, checkToken, deleteUser } from "../controllers/userController";

const userRouter = express.Router();



userRouter.route("/register")
    .post(registerUser);

userRouter.route("/login")
    .post(loginUser);

userRouter.route("/authorized")
    .post(checkToken);

userRouter.route("/delete")
    .delete(deleteUser);

export { userRouter }