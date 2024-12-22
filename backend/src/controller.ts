import { userModel  } from "./model";
import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import bcrypt from "bcrypt";
const saltRounds = 10;
const USER_EMAIL_HEADER = "X-User-Email";
const USER_PASSWORD_HEADER = "X-User-Password";
const ERROR_HEADER = "X-Error-Message";


function checkUser(inputEmail: String): Boolean {
    return userModel.exists( {email: inputEmail}) !== null;
}

const loginUser = (request: Request, response: Response) => {
    const modelData = request.body;
    const userEmail: String = modelData[USER_EMAIL_HEADER];
    const password: String = modelData[USER_PASSWORD_HEADER];
    userModel.findOne( {email: userEmail})
        .then(storedUser =>{
            // Create token
            console.log(storedUser?.password)
        }).catch(error => {
            response.status(HttpStatus.UNAUTHORIZED);
            response.send({ERROR_HEADER: error});
        })

};

const registerUser = (request: Request, response: Response) => {
    const modelData = request.body;
    const userEmail: String = modelData[USER_EMAIL_HEADER];
    const password: String = modelData[USER_PASSWORD_HEADER];
    if (!checkUser(userEmail)) {
        bcrypt.hash(password, saltRounds)
            .then((hash: String)=> {
                const newUser = new userModel({email: userEmail, password: hash});
                newUser.save();
                response.status(HttpStatus.CREATED);
                return response;
            }).catch((error: Error) => {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                response.send({ERROR_HEADER: error});
                return response;
            })
    }
    response.status(HttpStatus.CONFLICT);
    response.send({ERROR_HEADER: "Error, the current email is already in use."});
    return response;
};
