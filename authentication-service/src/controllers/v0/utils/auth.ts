import { userModel } from "../../../models/v0/userModel";
import { Response } from "express";
import bcrypt from "bcrypt";
import { createToken } from "./jwt";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_HEADER, USER_JWT_TOKEN_HEADER, USER_JWT_TOKEN_EXPIRATION_HEADER, ERROR_TAG } from "../../../models/v0/headers/userHeaders";
import { checkEmail, checkUser, createUser, deleteOneUser} from "./userUtils";
import { Token } from "../../../models/v0/tokenModel";

async function login(email: string, password: string, response :Response): Promise<Response> {
    try{
        if (checkEmail(email)) {
            const userExist = await checkUser(email);
            if (userExist) {
                const user = await userModel.findOne({email: email}) || null;
                if (user) {
                    const samePsw = await bcrypt.compare(password, user.password);
                    if (samePsw) {
                        const jwtToken: Token = await createToken(email);
                        response.status(HttpStatus.OK)
                            .send({
                                [USER_EMAIL_HEADER]: email,
                                [USER_JWT_TOKEN_EXPIRATION_HEADER]: jwtToken.expiration.getTime(),
                                [USER_JWT_TOKEN_HEADER]: jwtToken.token
                            });
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
        }else { 
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_TAG, "true");
            response.send({ERROR_TAG: "Error, the current email is already in use."});
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ERROR_TAG: error});
    }
    return response
}

async function register(email: string, password: string, role: string, response: Response): Promise<Response> { 
    try {
        if (checkEmail(email)) {
            const userExist = await checkUser(email);
            if (!userExist) {
                const user = await createUser(email, password, role);
                const jwtToken: Token = await createToken(email);
                response.status(HttpStatus.CREATED)
                    .send({
                        [USER_EMAIL_HEADER]: email,
                        [USER_JWT_TOKEN_HEADER]: jwtToken.token,
                        [USER_JWT_TOKEN_EXPIRATION_HEADER]: jwtToken.expiration.getTime()
                    });
            }else{
                response.status(HttpStatus.CONFLICT);
                response.setHeader(ERROR_TAG, "true");
                response.send({ERROR_TAG: "Error, the current email is already in use."});
            }
        }else{
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_TAG, "true");
            response.send({ERROR_TAG: "The input email is not well formatted"});
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ ERROR_TAG: error });
    }
    return response
}

async function deleteInputUser(email: string, response: Response): Promise<Response> {
    try {
        const userExist = await checkUser(email);
        if (checkEmail(email)) {
            if (userExist) {
                const status = await deleteOneUser(email)
                if (status){
                    response.status(HttpStatus.OK);
                }else{
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }else{
                response.status(HttpStatus.BAD_REQUEST);
                response.setHeader(ERROR_TAG, "true");
                response.send({ERROR_TAG: "The input user does not exist"});
            }
        }else { 
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_TAG, "true");
            response.send({ERROR_TAG: "Error, the current email is already in use."});
        }

    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_TAG, "true");
        response.send({ERROR_TAG: error});
    }
    return response;
}


export { login, register, deleteInputUser }