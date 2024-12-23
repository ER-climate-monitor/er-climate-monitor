import { userModel } from "../../models/userModel";
import { Response } from "express";
import bcrypt from "bcrypt";
import { createToken } from "./jwt";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_HEADER, USER_JWT_TOKEN, ERROR_TAG } from "../userController";
import { checkUser } from "./checkOnUsers";
import { saltRounds } from "../userController";

async function login(email: string, password: string, response :Response): Promise<Response> {
    try{
        const userExist = await checkUser(email);
        if (userExist) {
            const user = await userModel.findOne({email: email}) || null;
            if (user) {
                const samePsw = await bcrypt.compare(password, user.password);
                if (samePsw) {
                    const jwtToken: string = await createToken(email);
                    response.setHeader(USER_JWT_TOKEN, jwtToken);
                    response.setHeader(USER_EMAIL_HEADER, email);
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
    return response
}

async function register(email: string, password: string, response: Response): Promise<Response> { 
    try {
        const userExist = await checkUser(email);
        if (!userExist) {
            const hash: string = await bcrypt.hash(password, saltRounds);
            const newUser = new userModel({email: email, password: hash});
            const jwtToken: string = await createToken(email);
            newUser.save();
            response.setHeader(USER_JWT_TOKEN, jwtToken);
            response.setHeader(USER_EMAIL_HEADER, email);
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
    return response
}


export { login, register }