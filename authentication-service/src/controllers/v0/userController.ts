import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { login, register, deleteInputUser } from "./utils/auth";
import { tokenExpiration, verifyToken } from "./utils/jwt";
import { API_KEY_FIELD, USER_EMAIL_FIELD, USER_PASSWORD_FIELD, USER_JWT_TOKEN_EXPIRATION_FIELD, USER_JWT_TOKEN_FIELD, ADMIN_USER, NORMAL_USER, ERROR_HEADER, USER_ACTION_FIELD } from "../../models/v0/headers/userHeaders";
import { AUTHENTICATE, DELETE, LOGIN, REGISTER } from "./utils/userActions";

dotenv.config();

const secretKey = process.env.SECRET_API_KEY || "__"

function checkAction(tag: string, body: any, equalTo: string): boolean {
    return body[tag] === equalTo;
}

function isAdmin(data:any): boolean { 
    if (API_KEY_FIELD in data) {
        const API_KEY: string = data[API_KEY_FIELD]
        return API_KEY === secretKey
    }
    return false;
}

function fromBody<X>(body: any, key: string, defaultValue: X): X {
    return body && key in body ? body[key]: defaultValue;
}

const loginUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData && checkAction(USER_ACTION_FIELD, modelData, LOGIN)) {
        response = await login(fromBody<string>(modelData, USER_EMAIL_FIELD, ""), fromBody<string>(modelData, USER_PASSWORD_FIELD, ""), response);
    }
    response.end();
};

const loginAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;
    if(modelData && checkAction(USER_ACTION_FIELD, modelData, LOGIN)) {
        if (isAdmin(modelData)) {
            response = await login(fromBody<string>(modelData, USER_EMAIL_FIELD, ""), fromBody<string>(modelData, USER_PASSWORD_FIELD, ""), response);
        }else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }
    response.end();
};

const registerUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData && checkAction(USER_ACTION_FIELD, modelData, REGISTER)) {
        response = await register(fromBody<string>(modelData, USER_EMAIL_FIELD, ""), fromBody<string>(modelData, USER_PASSWORD_FIELD, ""), NORMAL_USER, response);
    }
    response.end()
};

const registerAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;

    if (modelData && checkAction(USER_ACTION_FIELD, modelData, REGISTER)) {
        if (isAdmin(modelData)) {
            response = await register(fromBody<string>(modelData, USER_EMAIL_FIELD, ""), fromBody<string>(modelData, USER_PASSWORD_FIELD, ""), ADMIN_USER, response);
        }else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }
    response.end()
};

const deleteUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData && checkAction(USER_ACTION_FIELD, modelData, DELETE)) {
        response = await deleteInputUser(fromBody<string>(modelData, USER_EMAIL_FIELD, ""), response);
    }
    response.end();
};

const deleteAdmin = async (request: Request, response: Response) => {
    const modelData = request.body;
    if (modelData) {
        if (isAdmin(modelData)) {
            response = await deleteInputUser(fromBody(modelData, USER_EMAIL_FIELD, ""), response);
        }else {
            response.status(HttpStatus.UNAUTHORIZED);
        }
    }
    response.end();
};

const checkToken = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        if (modelData && checkAction(USER_ACTION_FIELD, modelData, AUTHENTICATE)) {
            const jwtToken: string = fromBody<string>(modelData, USER_JWT_TOKEN_FIELD, "");
            const verified = await verifyToken(jwtToken);
            if (verified) {
                response.status(HttpStatus.ACCEPTED)
                    .send({
                        [USER_JWT_TOKEN_EXPIRATION_FIELD]: tokenExpiration(jwtToken).getTime()
                    });
            }else{
                response.status(HttpStatus.UNAUTHORIZED);
            }
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_HEADER, "true");
        response.send({ERROR_TAG: error});
    }
    response.end();
};

export { registerUser, registerAdmin, loginUser, loginAdmin, deleteUser, deleteAdmin, checkToken }