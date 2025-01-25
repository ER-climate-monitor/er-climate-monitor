import { userModel } from '../../../models/v0/userModel';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import { createToken } from './jwt';
import HttpStatus from 'http-status-codes';
import {
    USER_EMAIL_FIELD,
    USER_JWT_TOKEN_EXPIRATION_FIELD,
    USER_JWT_TOKEN_FIELD,
    ERROR_FIELD,
    USER_ROLE_FIELD,
} from '../../../models/v0/headers/userHeaders';
import { checkEmail, checkPassword, checkUser, createUser, deleteOneUser } from './userUtils';
import { Token } from '../../../models/v0/tokenModel';

function checkEmailAndPassword(email: string, password: string, response: Response) {
    if (!checkEmail(email)) {
        response.status(HttpStatus.NOT_ACCEPTABLE).send({ ERROR_FIELD: 'The input email is not well formatted' });
        return false;
    }
    if (!checkPassword(password)) {
        response.status(HttpStatus.NOT_ACCEPTABLE).send({ ERROR_FIELD: 'The password is not well formatted' });
        return false;
    }
    return true;
}

async function login(email: string, password: string, role: string, response: Response): Promise<void> {
    try {
        if (!checkEmailAndPassword(email, password, response)) {
            return;
        }
        const userExist = await checkUser(email);
        if (userExist) {
            const user = (await userModel.findOne({ email: email })) || null;
            if (user) {
                const samePsw = await bcrypt.compare(password, user.password);
                if (samePsw) {
                    const jwtToken: Token = await createToken(email, role);
                    response.status(HttpStatus.OK).send({
                        [USER_EMAIL_FIELD]: email,
                        [USER_JWT_TOKEN_EXPIRATION_FIELD]: jwtToken.expiration.getTime(),
                        [USER_JWT_TOKEN_FIELD]: jwtToken.token,
                        [USER_ROLE_FIELD]: role,
                    });
                } else {
                    response.status(HttpStatus.CONFLICT);
                    response.setHeader(ERROR_FIELD, 'true');
                    response.send({ ERROR_FIELD: 'Wrong password' });
                }
            }
        } else {
            response.status(HttpStatus.FORBIDDEN).send({ ERROR_FIELD: 'Wrong input email, the user does not exists' });
        }
    } catch (error) {
        response.status(HttpStatus.BAD_REQUEST).send({ ERROR_FIELD: error });
    } finally {
        response.end();
    }
}

async function register(email: string, password: string, role: string, response: Response): Promise<void> {
    try {
        if (!checkEmailAndPassword(email, password, response)) {
            return;
        }
        const userExist = await checkUser(email);
        if (!userExist) {
            await createUser(email, password, role);
            const jwtToken: Token = await createToken(email, role);
            response.status(HttpStatus.CREATED).send({
                [USER_EMAIL_FIELD]: email,
                [USER_JWT_TOKEN_FIELD]: jwtToken.token,
                [USER_JWT_TOKEN_EXPIRATION_FIELD]: jwtToken.expiration.getTime(),
                [USER_ROLE_FIELD]: role,
            });
        } else {
            response.status(HttpStatus.CONFLICT).send({ ERROR_FIELD: 'Error, the current email is already in use.' });
        }
    } catch (error) {
        response.status(HttpStatus.BAD_REQUEST).send({ ERROR_FIELD: error });
    } finally {
        response.end();
    }
}

async function deleteInputUser(email: string, response: Response): Promise<Response> {
    try {
        const userExist = await checkUser(email);
        if (checkEmail(email)) {
            if (userExist) {
                const status = await deleteOneUser(email);
                if (status) {
                    response.status(HttpStatus.OK);
                } else {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                response.status(HttpStatus.BAD_REQUEST);
                response.setHeader(ERROR_FIELD, 'true');
                response.send({ ERROR_FIELD: 'The input user does not exist' });
            }
        } else {
            response.status(HttpStatus.NOT_ACCEPTABLE);
            response.setHeader(ERROR_FIELD, 'true');
            response.send({ ERROR_FIELD: 'Error, the current email is already in use.' });
        }
    } catch (error) {
        response.status(HttpStatus.BAD_REQUEST);
        response.setHeader(ERROR_FIELD, 'true');
        response.send({ ERROR_FIELD: error });
    }
    return response;
}

export { login, register, deleteInputUser };
