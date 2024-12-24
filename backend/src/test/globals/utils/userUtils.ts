import { Application } from "express";
import { expect } from "chai"
import request from "supertest"
import HttpStatus from "http-status-codes";

const DELETE_USER_ROUTE = "/user/delete";
const DELETE_ADMIN_ROUTE = "/user/admin/delete";
const REGISTER_USER_ROUTE = "/user/register";
const REGISTER_ADMIN_ROUTE = "/user/admin/register";

async function deleteUser(app: Application, userInformation: any) {
    const registered = await isUserRegistered(app, userInformation);
    if (registered) {
        const response = await request(app).delete(DELETE_USER_ROUTE).send(userInformation);
        expect(response.statusCode).to.equal(HttpStatus.OK);
    }
}

async function deleteAdmin(app: Application, adminInformation: any) {
    const registered = await isAdminRegistered(app, adminInformation);
    if (registered) {
        const response = await request(app).delete(DELETE_ADMIN_ROUTE).send(adminInformation);
        expect(response.statusCode).to.equal(HttpStatus.OK); 
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