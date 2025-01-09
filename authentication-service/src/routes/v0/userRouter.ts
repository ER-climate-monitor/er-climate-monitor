import express from "express";
import { registerUser, loginUser, checkToken, deleteUser, registerAdmin, loginAdmin, deleteAdmin } from "../../controllers/v0/userController";
import { AUTHORIZED_PATH, DELETE_ADMIN_PATH, DELETE_PATH, LOGIN_ADMIN_PATH, LOGIN_PATH, REGISTER_ADMIN_PATH, REGISTER_PATH } from "./paths/user.paths";
const userRouter = express.Router();



userRouter.route(REGISTER_PATH)
    .post(registerUser);

userRouter.route(REGISTER_ADMIN_PATH)
    .post(registerAdmin)

userRouter.route(LOGIN_PATH)
    .post(loginUser);
userRouter.route(LOGIN_ADMIN_PATH)
    .post(loginAdmin)

userRouter.route(AUTHORIZED_PATH)
    .post(checkToken);

userRouter.route(DELETE_PATH)
    .delete(deleteUser);

userRouter.route(DELETE_ADMIN_PATH)
    .delete(deleteAdmin);

export { userRouter }