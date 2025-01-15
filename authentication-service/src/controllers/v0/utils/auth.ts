import { userModel } from "../../../models/v0/userModel";
import { Response } from "express";
import bcrypt from "bcrypt";
import { createToken } from "./jwt";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_FIELD, USER_JWT_TOKEN_EXPIRATION_FIELD, USER_JWT_TOKEN_FIELD, ERROR_FIELD } from "../../../models/v0/headers/userHeaders";
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
                                [USER_EMAIL_FIELD]: email,
                                [USER_JWT_TOKEN_EXPIRATION_FIELD]: jwtToken.expiration.getTime(),
                                [USER_JWT_TOKEN_FIELD]: jwtToken.token
                            });
                    }else{
                        response.status(HttpStatus.CONFLICT);
                        response.setHeader(ERROR_FIELD, "true");
                        response.send({ERROR_FIELD: "Wrong password"});
                    }
                }
            }else {
                response.status(HttpStatus.FORBIDDEN);
                response.setHeader(ERROR_FIELD, "true");
                response.send({ERROR_FIELD: "Wrong input email, the user does not exists"});
            }
        }else { 
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_FIELD, "true");
            response.send({ERROR_FIELD: "Error, the current email is already in use."});
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_FIELD, "true");
        response.send({ERROR_FIELD: error});
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
                        [USER_EMAIL_FIELD]: email,
                        [USER_JWT_TOKEN_FIELD]: jwtToken.token,
                        [USER_JWT_TOKEN_EXPIRATION_FIELD]: jwtToken.expiration.getTime()
                    });
            }else{
                response.status(HttpStatus.CONFLICT);
                response.setHeader(ERROR_FIELD, "true");
                response.send({ERROR_FIELD: "Error, the current email is already in use."});
            }
        }else{
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_FIELD, "true");
            response.send({ERROR_FIELD: "The input email is not well formatted"});
        }
    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_FIELD, "true");
        response.send({ ERROR_FIELD: error });
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
                response.setHeader(ERROR_FIELD, "true");
                response.send({ERROR_FIELD: "The input user does not exist"});
            }
        }else { 
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_FIELD, "true");
            response.send({ERROR_FIELD: "Error, the current email is already in use."});
        }

    }catch(error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_FIELD, "true");
        response.send({ERROR_FIELD: error});
    }
    return response;
}


export { login, register, deleteInputUser }