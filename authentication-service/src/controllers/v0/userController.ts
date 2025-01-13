import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { login, register, deleteInputUser } from "./utils/auth";
import { tokenExpiration, verifyToken } from "./utils/jwt";
import { API_KEY_HEADER, USER_EMAIL_HEADER, USER_PASSWORD_HEADER, USER_JWT_TOKEN_EXPIRATION_HEADER, USER_JWT_TOKEN_HEADER, ADMIN_USER, NORMAL_USER, ERROR_TAG } from "../../models/v0/headers/userHeaders";

dotenv.config();

const saltRounds  = Number(process.env.saltRounds) || 10;
const secretKey = process.env.SECRET_API_KEY || "__"
const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "somesecret"

function isAdmin(data:any): boolean { 
    if (API_KEY_HEADER in data) {
        const API_KEY: string = data[API_KEY_HEADER]
        return API_KEY === secretKey
    }
    return false;
}

function fromBody<X>(body: any, key: string, defaultValue: X): X {
    return body && key in body ? body[key]: defaultValue;
}

const loginUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        response = await login(fromBody<string>(modelData, USER_EMAIL_HEADER, ""), fromBody<string>(modelData, USER_PASSWORD_HEADER, ""), response);
        response.end();
    }
};

const loginAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;
    if(modelData) {
        if (isAdmin(modelData)) {
            response = await login(fromBody<string>(modelData, USER_EMAIL_HEADER, ""), fromBody<string>(modelData, USER_PASSWORD_HEADER, ""), response);
        }else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }
    response.end();
};

const registerUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        response = await register(fromBody<string>(modelData, USER_EMAIL_HEADER, ""), fromBody<string>(modelData, USER_PASSWORD_HEADER, ""), NORMAL_USER, response);
        response.end()
    }
};

const registerAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        if (isAdmin(modelData)) {
            response = await register(fromBody<string>(modelData, USER_EMAIL_HEADER, ""), fromBody<string>(modelData, USER_PASSWORD_HEADER, ""), ADMIN_USER, response);
        }else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }
    response.end()
};

const deleteUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        response = await deleteInputUser(fromBody<string>(modelData, USER_EMAIL_HEADER, ""), response);
    }
    response.end();
};

const deleteAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        if (isAdmin(modelData)) {
            response = await deleteInputUser(fromBody(modelData, USER_EMAIL_HEADER, ""), response);
        }else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }
    response.end();
};

const checkToken = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        if (modelData) {
            const jwtToken: string = fromBody<string>(modelData, USER_JWT_TOKEN_HEADER, "");
            const verified = await verifyToken(jwtToken);
            if (verified) {
                response.status(HttpStatus.ACCEPTED)
                    .send({
                        [USER_JWT_TOKEN_EXPIRATION_HEADER]: tokenExpiration(jwtToken).getTime()
                    });
            }else{
                response.status(HttpStatus.UNAUTHORIZED);
            }
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ERROR_TAG: error});
    }
    response.end();
};

export { registerUser, registerAdmin, loginUser, loginAdmin, deleteUser, deleteAdmin, checkToken }
export { USER_EMAIL_HEADER, USER_PASSWORD_HEADER, USER_JWT_TOKEN_HEADER, USER_JWT_TOKEN_EXPIRATION_HEADER, ERROR_TAG, jwtSecretKey, saltRounds }