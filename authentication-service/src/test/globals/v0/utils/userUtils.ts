import { Application } from "express";
import request from "supertest"
import HttpStatus from "http-status-codes";
import { DELETE_ADMIN_ROUTE, DELETE_USER_ROUTE, REGISTER_ADMIN_ROUTE, REGISTER_USER_ROUTE } from "../routes/globalRoutes.v0";


async function deleteUser(app: Application, userInformation: any) {
    const registered = await isUserRegistered(app, userInformation);
    if (registered) {
        await request(app)
            .delete(DELETE_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.OK);
    }
}

async function deleteAdmin(app: Application, adminInformation: any) {
    const registered = await isAdminRegistered(app, adminInformation);
    if (registered) {
        await request(app)
            .delete(DELETE_ADMIN_ROUTE)
            .send(adminInformation)
            .expect(HttpStatus.OK); 
    }
}

async function isUserRegistered(app: Application, userInformation: any) { 
    const response = await request(app).post(REGISTER_USER_ROUTE).send(userInformation);
    return response.statusCode == HttpStatus.CONFLICT || response.statusCode == HttpStatus.CREATED;
}


async function isAdminRegistered(app: Application, adminInformation: any) {
    const response = await request(app).post(REGISTER_ADMIN_ROUTE).send(adminInformation);
    return response.statusCode == HttpStatus.CONFLICT ||  response.statusCode == HttpStatus.CREATED; 
}

export { deleteAdmin, deleteUser }