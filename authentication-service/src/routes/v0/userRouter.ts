import express from "express";
import { registerUser, loginUser, checkToken, deleteUser, registerAdmin, loginAdmin, deleteAdmin } from "../../controllers/v0/userController";

const userRouter = express.Router();



userRouter.route("/register")
    .post(registerUser);

userRouter.route("/admin/register")
    .post(registerAdmin)

userRouter.route("/login")
    .post(loginUser);
userRouter.route("/admin/login")
    .post(loginAdmin)

userRouter.route("/authorized")
    .post(checkToken);

userRouter.route("/delete")
    .delete(deleteUser);

userRouter.route("/admin/delete")
    .delete(deleteAdmin);

export { userRouter }