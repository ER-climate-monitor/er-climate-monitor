import express from "express";
import { registerUser, loginUser, checkToken } from "../controllers/controller";

const userRouter = express.Router();



userRouter.route("/register")
    .post(registerUser);

userRouter.route("/login")
    .post(loginUser);

userRouter.route("/authorized")
    .post(checkToken);

export { userRouter }