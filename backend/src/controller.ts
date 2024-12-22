import { userModel  } from "./model";
import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;
const USER_EMAIL_HEADER = "X-User-Email";
const USER_PASSWORD_HEADER = "X-User-Password";
const USER_JWT_TOKEN = "X-User-Token";
const ERROR_HEADER = "X-Error-Message";


async function checkUser(inputEmail: String): Promise<Boolean> {
    const existingUser: Boolean = await userModel.findOne({email: inputEmail}) || false;
    return existingUser
}

async function createToken(inputEmail: String): Promise<string> {
    const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "";
    const user = await userModel.findOne({email: inputEmail});
    const data = { time: Date(), userId: user?.id,};
    const token = jwt.sign(data, jwtSecretKey);
    return token;
}

const loginUser = (request: Request, response: Response) => {
    const modelData = request.body;
    const userEmail: String = modelData[USER_EMAIL_HEADER];
    const password: String = modelData[USER_PASSWORD_HEADER];
    userModel.findOne( {email: userEmail})
        .then(storedUser =>{
            console.log(storedUser?.password)
        }).catch(error => {
            response.status(HttpStatus.UNAUTHORIZED);
            response.send({ERROR_HEADER: error});
        });
    response.end();
};

const registerUser = async (request: Request, response: Response) => {
    const modelData = request.body;
    const userEmail: String = modelData[USER_EMAIL_HEADER];
    const password: string = modelData[USER_PASSWORD_HEADER];
    const userExist = await checkUser(userEmail);
    if (!userExist) {
        const hash: String = await bcrypt.hash(password, saltRounds);
        const newUser = new userModel({email: userEmail, password: hash});
        newUser.save();
        const jwtToken: string = await createToken(userEmail);
        response.setHeader(USER_JWT_TOKEN, jwtToken);
        response.status(HttpStatus.CREATED);
    }else{
        response.status(HttpStatus.CONFLICT);
        response.send({ERROR_HEADER: "Error, the current email is already in use."});
    }
    response.end()
};


export { registerUser, loginUser }