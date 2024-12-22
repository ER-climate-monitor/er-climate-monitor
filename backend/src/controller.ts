import { userModel  } from "./model";
import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import bcrypt from "bcrypt";
const saltRounds = 10;
const USER_EMAIL_HEADER = "X-User-Email";
const USER_PASSWORD_HEADER = "X-User-Password";
const ERROR_HEADER = "X-Error-Message";


async function checkUser(inputEmail: String): Promise<Boolean> {
    const existingUser: Boolean = await userModel.findOne({email: inputEmail}) || false;
    console.log(existingUser)
    return existingUser
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
    console.log(userModel.collection);
    if (!userExist) {
        const hash: String = await bcrypt.hash(password, saltRounds);
        const newUser = new userModel({email: userEmail, password: hash});
        newUser.save();
        response.status(HttpStatus.CREATED);
    }else{
        response.status(HttpStatus.CONFLICT);
        response.send({ERROR_HEADER: "Error, the current email is already in use."});
    }
    response.end()
};


export { registerUser, loginUser }