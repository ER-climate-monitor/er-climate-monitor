import { Application } from 'express';
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import {
    DELETE_ADMIN_ROUTE,
    DELETE_USER_ROUTE,
    LOGIN_ADMIN_ROUTE,
    LOGIN_USER_ROUTE,
    REGISTER_ADMIN_ROUTE,
    REGISTER_USER_ROUTE,
} from '../routes/globalRoutes.v0';
import { API_KEY_HEADER, USER_ACTION_FIELD, USER_EMAIL_FIELD, USER_JWT_TOKEN_FIELD, USER_TOKEN_HEADER } from '../../../../models/v0/headers/userHeaders';
import { LOGIN, REGISTER } from '../../../../controllers/v0/utils/userActions';

const api_key = process.env.SECRET_API_KEY || '';

async function deleteUser(app: Application, userInformation: any) {
    const token = await isUserRegistered(app, userInformation);
    if (token) {
        await request(app)
            .delete(DELETE_USER_ROUTE)
            .query({[USER_EMAIL_FIELD]:userInformation[USER_EMAIL_FIELD]})
            .set(USER_TOKEN_HEADER, token)
            .expect(HttpStatus.OK);
    }
}

async function deleteAdmin(app: Application, adminInformation: any) {
    const token = await isAdminRegistered(app, adminInformation);
    if (token) {
        await request(app)
            .delete(DELETE_ADMIN_ROUTE)
            .query({[USER_EMAIL_FIELD]:adminInformation[USER_EMAIL_FIELD]})
            .set(API_KEY_HEADER, api_key)
            .set(USER_TOKEN_HEADER, token)
            .expect(HttpStatus.OK);
    }
}

async function isUserRegistered(app: Application, userInformation: {}) {
    const response = await request(app).post(REGISTER_USER_ROUTE).send(createBodyUser(REGISTER, userInformation));
    if (response.status === HttpStatus.CREATED) {
        return response.body[USER_JWT_TOKEN_FIELD];
    }
    const login = await request(app).post(LOGIN_USER_ROUTE).send(createBodyUser(LOGIN, userInformation));
    return login.body[USER_JWT_TOKEN_FIELD];
}

async function isAdminRegistered(app: Application, adminInformation: {}) {
    const response = await request(app).post(REGISTER_ADMIN_ROUTE).send(createBodyUser(REGISTER, adminInformation));
    if (response.status === HttpStatus.CREATED) {
        return response.body[USER_JWT_TOKEN_FIELD];
    }
    const login = await request(app).post(LOGIN_ADMIN_ROUTE).send(createBodyUser(LOGIN, adminInformation));
    return login.body[USER_JWT_TOKEN_FIELD];
}

function createBodyUser(action: string, info: { [key: string]: string }) {
    let message: { [key: string]: string } = {};
    message[USER_ACTION_FIELD] = action;
    for (const key in info) {
        message[key] = info[key];
    }
    return message;
}

export { deleteAdmin, deleteUser, createBodyUser };
