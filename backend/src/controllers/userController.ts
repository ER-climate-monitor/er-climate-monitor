import { userModel  } from "../model";
import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();


const saltRounds = process.env.saltRounds || 10;
const USER_EMAIL_HEADER = process.env.USER_EMAIL_HEADER || "X-User-Email";
const USER_PASSWORD_HEADER = process.env.USER_PASSWORD_HEADER || "X-User-Password";
const USER_JWT_TOKEN = process.env.USER_JWT_TOKEN || "X-User-Token";
const ERROR_TAG = process.env.ERROR_TAG || "X-Error-Message";


const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "somesecret";



async function checkUser(inputEmail: String): Promise<Boolean> {
    const existingUser: Boolean = await userModel.findOne({email: inputEmail}) || false;
    return existingUser
}

async function createToken(inputEmail: String): Promise<string> {
    const user = await userModel.findOne({email: inputEmail});
    const data = { time: Date(), userId: user?.id,};
    const token = jwt.sign(data, jwtSecretKey);
    return token;
}

const loginUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    try{
        const userEmail: string = modelData[USER_EMAIL_HEADER];
        const password: string = modelData[USER_PASSWORD_HEADER];
        const userExist = await checkUser(userEmail);
        if (userExist) {
            const user = await userModel.findOne({email: userEmail}) || null;
            if (user) {
                const samePsw = await bcrypt.compare(password, user.password);
                if (samePsw) {
                    const jwtToken: string = await createToken(userEmail);
                    response.setHeader(USER_JWT_TOKEN, jwtToken);
                    response.setHeader(USER_EMAIL_HEADER, userEmail);
                }else{
                    response.status(HttpStatus.CONFLICT);
                    response.setHeader(ERROR_TAG, "true");
                    response.send({ERROR_TAG: "Wrong password"});
                }
            }
        }else {
            response.status(HttpStatus.FORBIDDEN);
            response.setHeader(ERROR_TAG, "true");
            response.send({ERROR_TAG: "Wrong input email, the user does not exists"});
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ERROR_TAG: error});
    }
    response.end();
};

const registerUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        const userEmail: string = modelData[USER_EMAIL_HEADER];
        const password: string = modelData[USER_PASSWORD_HEADER];
        const userExist = await checkUser(userEmail);
        if (!userExist) {
            const hash: String = await bcrypt.hash(password, saltRounds);
            const newUser = new userModel({email: userEmail, password: hash});
            newUser.save();
            const jwtToken: string = await createToken(userEmail);
            response.setHeader(USER_JWT_TOKEN, jwtToken);
            response.setHeader(USER_EMAIL_HEADER, userEmail);
            response.status(HttpStatus.CREATED);
        }else{
            response.status(HttpStatus.CONFLICT);
            response.setHeader(ERROR_TAG, "true");
            response.send({ERROR_TAG: "Error, the current email is already in use."});
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ ERROR_TAG: error });
    }
    response.end()
};

const checkToken = async (request: Request, response: Response) => {
    const modelData = request.body;
    try {
        const jwtToken: string = modelData[USER_JWT_TOKEN];
        const verified = jwt.verify(jwtToken, jwtSecretKey);
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


export { registerUser, loginUser, checkToken }