import { Application } from "express";
import request from "supertest"
import HttpStatus from "http-status-codes";
import { DELETE_ADMIN_ROUTE, DELETE_USER_ROUTE, REGISTER_ADMIN_ROUTE, REGISTER_USER_ROUTE } from "../routes/globalRoutes.v0";
import { USER_ACTION_FIELD } from "../../../../models/v0/headers/userHeaders";
import { DELETE, REGISTER } from "../../../../controllers/v0/utils/userActions";


async function deleteUser(app: Application, userInformation: any) {
    const registered = await isUserRegistered(app, userInformation);
    if (registered) {
        await request(app)
            .delete(DELETE_USER_ROUTE)
            .send(createBodyUser(DELETE, userInformation))
            .expect(HttpStatus.OK);
    }
}

async function deleteAdmin(app: Application, adminInformation: any) {
    const registered = await isAdminRegistered(app, adminInformation);
    if (registered) {
        await request(app)
            .delete(DELETE_ADMIN_ROUTE)
            .send(createBodyUser(DELETE, adminInformation))
            .expect(HttpStatus.OK); 
    }
}

async function isUserRegistered(app: Application, userInformation: {}) { 
    const response = await request(app).post(REGISTER_USER_ROUTE).send(createBodyUser(REGISTER, userInformation));
    return response.statusCode == HttpStatus.CONFLICT || response.statusCode == HttpStatus.CREATED;
}


async function isAdminRegistered(app: Application, adminInformation: {}) {
    const response = await request(app).post(REGISTER_ADMIN_ROUTE).send(createBodyUser(REGISTER, adminInformation));
    return response.statusCode == HttpStatus.CONFLICT ||  response.statusCode == HttpStatus.CREATED; 
}

function createBodyUser(action: string, info: { [key: string]: string }) {
    let message:{ [key: string]: string } = {}
    message[USER_ACTION_FIELD] = action;
    for (const key in info) {
        message[key] = info[key];
    }
    return message
}

export { deleteAdmin, deleteUser, createBodyUser, }