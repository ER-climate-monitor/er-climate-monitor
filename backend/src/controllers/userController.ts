import { userModel  } from "../models/userModel";
import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import dotenv from 'dotenv';
import { DeleteResult } from "mongoose";
import jwt from "jsonwebtoken";
import { login, register } from "./utils/auth";
import { checkUser } from "./utils/checkOnUsers";
import { verifyToken } from "./utils/jwt";

dotenv.config();


const saltRounds  = Number(process.env.saltRounds) || 10;
const USER_EMAIL_HEADER = process.env.USER_EMAIL_HEADER || "X-User-Email";
const USER_PASSWORD_HEADER = process.env.USER_PASSWORD_HEADER || "X-User-Password";
const USER_JWT_TOKEN = process.env.USER_JWT_TOKEN || "X-User-Token";
const ERROR_TAG = process.env.ERROR_TAG || "X-Error-Message";
const API_KEY_HEADER = process.env.API_KEY_HEADER || "X-Api-Key"
const secretKey = process.env.SECRET_API_KEY || "__"
const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "somesecret"


const loginUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    response = await login(modelData[USER_EMAIL_HEADER], modelData[USER_PASSWORD_HEADER], response);
    response.end();
};

const loginAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;
    const API_KEY: string = modelData[API_KEY_HEADER]
    if (API_KEY === secretKey) {
        response = await login(modelData[USER_EMAIL_HEADER], modelData[USER_PASSWORD_HEADER], response);
    }else {
        response.status(HttpStatus.UNAUTHORIZED);
    }
    response.end();
};

const registerUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    response = await register(modelData[USER_EMAIL_HEADER], modelData[USER_PASSWORD_HEADER], response);
    response.end()
};

const deleteUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        const userEmail: string = modelData[USER_EMAIL_HEADER];
        const password: string = modelData[USER_PASSWORD_HEADER];
        const userExist = await checkUser(userEmail);
        if (userExist) {
            const status: DeleteResult = await userModel.deleteOne({email: userEmail});
            if (status.deletedCount === 1){
                response.status(HttpStatus.OK);
            }else{
                response.status(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }else{
            response.status(HttpStatus.BAD_REQUEST);
            response.setHeader(ERROR_TAG, "true");
            response.send({ERROR_TAG: "The input user does not exist"});
        }

    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ERROR_TAG: error});
    }
    response.end();
};

const checkToken = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        const jwtToken: string = modelData[USER_JWT_TOKEN];
        const verified = verifyToken(jwtToken);
        if (verified) {
            response.status(HttpStatus.ACCEPTED);
        }else{
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ERROR_TAG: error});
    }
    response.end();
};

export { registerUser, loginUser, loginAdmin, deleteUser, checkToken }
export { USER_EMAIL_HEADER, USER_PASSWORD_HEADER, USER_JWT_TOKEN, ERROR_TAG, jwtSecretKey, saltRounds }