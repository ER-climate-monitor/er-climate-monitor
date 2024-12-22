import express from "express";
import { registerUser, loginUser } from "./controller";

const userRouter = express.Router();



userRouter.route("/register")
    .post(registerUser);

export { userRouter }