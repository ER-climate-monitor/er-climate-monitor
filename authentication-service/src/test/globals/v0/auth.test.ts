import request from "supertest"
import createServer from "../../..";
import { describe, it, afterEach } from "mocha";
import { fail, ok } from "node:assert";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_HEADER, USER_PASSWORD_HEADER } from "../../../controllers/v0/userController";
import { Application } from "express";
import { deleteAdmin, deleteUser } from "./utils/userUtils";
import { REGISTER_ADMIN_ROUTE, REGISTER_USER_ROUTE, DELETE_ADMIN_ROUTE, DELETE_USER_ROUTE, LOGIN_ADMIN_ROUTE, LOGIN_USER_ROUTE } from "./routes/globalRoutes.v0";

const email = "testemail1@gmail.com";
const password = "AVeryStrongPassword1010";
const api_key = process.env.SECRET_API_KEY || "";
const API_KEY_HEADER = String(process.env.API_KEY_HEADER)


const userInformation = {
    [USER_EMAIL_HEADER]: email,
    [USER_PASSWORD_HEADER]: password,
};

const adminInformation = {
    [USER_EMAIL_HEADER]: email,
    [USER_PASSWORD_HEADER]: password,
    [API_KEY_HEADER]: api_key
};

const maliciousEmails: Array<String> = ['{"$ne": null}', "notanemail`DROP DATABASE *`@gmail.com", '{"$gt": ""}', '{"$regex": ".*", "$options": "i"}']

const app: Application = createServer();

describe("User Authentication", () => {
    before(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
    })
    it("should return OK if the email does not exists inside the Database", async () => {
        await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.CREATED)
            .expect(response => {
                const responseEmail = response.body[USER_EMAIL_HEADER];
                if ((responseEmail !== email)){
                    fail();
                }
            });
    });
    it("should return an error if I try to create a new user with an email already registered", async () => {
        await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.CREATED);
        await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.CONFLICT);
    });
    it("Should return an error if the input email is not well formatted during the registration, login and delete even if the user is not registered", async () => {
        for (const maliciousEmail in maliciousEmails) {
            const badInformation = {
                [USER_EMAIL_HEADER]: maliciousEmail,
                [USER_PASSWORD_HEADER]: password
            };
            await request(app)
                .post(REGISTER_USER_ROUTE)
                .send(badInformation)
                .expect(HttpStatus.NOT_ACCEPTABLE);
            await request(app)
                .post(LOGIN_USER_ROUTE)
                .send(badInformation)
                .expect(HttpStatus.NOT_ACCEPTABLE);
            await request(app)
                .delete(DELETE_USER_ROUTE)
                .send(badInformation)
                .expect(HttpStatus.NOT_ACCEPTABLE);
        }
    });
    it("Should return an error if the input email is not well formatted during the registration, login and delete of an Admin, even if the user is not registered", async () => {
        for (const maliciousEmail in maliciousEmails) {
            const badInformation = {
                [USER_EMAIL_HEADER]: maliciousEmail,
                [USER_PASSWORD_HEADER]: password,
                [API_KEY_HEADER]: api_key
            };
            await request(app)
                .post(REGISTER_ADMIN_ROUTE)
                .send(badInformation)
                .expect(HttpStatus.NOT_ACCEPTABLE);
            await request(app)
                .post(LOGIN_ADMIN_ROUTE )
                .send(badInformation)
                .expect(HttpStatus.NOT_ACCEPTABLE);
            await request(app)
                .delete(DELETE_ADMIN_ROUTE)
                .send(badInformation)
                .expect(HttpStatus.NOT_ACCEPTABLE);
        }
    });
    it("should return OK if I register an Admin using the correct API key and using an email that does not exist", async () => {
        await request(app)
            .post(REGISTER_ADMIN_ROUTE)
            .send(adminInformation)
            .expect(HttpStatus.CREATED)
            .expect(response => {
                const responseEmail = response.body[USER_EMAIL_HEADER];
                if ((responseEmail !== email)){
                    fail();
                }
            });
    });
    it("Should return and error if I try to create a new Admin without speciifying the API key", async () => {
        await request(app)
            .post(REGISTER_ADMIN_ROUTE) 
            .send(userInformation)
            .expect(HttpStatus.UNAUTHORIZED);
    });
    it("After user registration, It should be possible to use the same credentials for the login", async () => {
        await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.CREATED)
            .expect(response => {
                const responseEmail = response.body[USER_EMAIL_HEADER];
                if ((responseEmail !== email)){
                    fail();
                }
            });
        await request(app)
            .post(LOGIN_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.OK)
            .expect(response => {
                const responseEmail = response.body[USER_EMAIL_HEADER];
                if (responseEmail !== email) {
                    fail();
                }
            })
    });
    it("After admin registration, It should be possible to use the same credentials for the login", async () => {
        await request(app)
            .post(REGISTER_ADMIN_ROUTE)
            .send(adminInformation)
            .expect(HttpStatus.CREATED)
            .expect(response => {
                const responseEmail = response.body[USER_EMAIL_HEADER];
                if ((responseEmail !== email)){
                    fail();
                }
            });
        await request(app)
            .post(LOGIN_ADMIN_ROUTE)
            .send(adminInformation)
            .expect(HttpStatus.OK);
    });
    afterEach(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
    });
});