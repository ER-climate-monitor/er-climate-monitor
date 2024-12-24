import { expect } from "chai"
import request from "supertest"
import createServer from "../..";
import { describe, it, after, afterEach } from "mocha";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_HEADER, USER_PASSWORD_HEADER } from "../../controllers/userController";
import { Application } from "express";
import { deleteAdmin, deleteUser } from "./utils/userUtils";

const TEST_PORT = 10_000;
const email = "testemail1@gmail.com";
const password = "AVeryStrongPassword1010";
const api_key = process.env.SECRET_API_KEY || "";

const REGISTER_USER_ROUTE = "/user/register";
const REGISTER_ADMIN_ROUTE = "/user/admin/register";
const LOGIN_USER_ROUTE = "/user/login";
const LOGIN_ADMIN_ROUTE = "/user/admin/login";


const userInformation = {
    [USER_EMAIL_HEADER]: email,
    [USER_PASSWORD_HEADER]: password,
};

const adminInformation = {
    [USER_EMAIL_HEADER]: email,
    [USER_PASSWORD_HEADER]: password,
    [String(process.env.API_KEY_HEADER)]: api_key
};

const app: Application = createServer();

describe("User Authentication", () => {
    before(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
    })
    it("should return OK if the email does not exists inside the Database", async () => {
        const response = (await request(app).post(REGISTER_USER_ROUTE).send(userInformation));
        expect(response.statusCode).to.equal(HttpStatus.CREATED);
        expect(response.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(userInformation[USER_EMAIL_HEADER]);
    });
    it("should return an error if I try to create a new user with an email already registered", async () => {
        const response = (await request(app).post(REGISTER_USER_ROUTE).send(userInformation));
        const secondResponse = await request(app).post(REGISTER_USER_ROUTE).send(userInformation);
        expect(response.statusCode).to.equal(HttpStatus.CREATED);
        expect(secondResponse.statusCode).to.equal(HttpStatus.CONFLICT);
    });
    it("should return OK if I register an Admin using the correct API key and using an email that does not exist", async () => {
        const response = (await request(app).post(REGISTER_ADMIN_ROUTE).send(adminInformation));
        expect(response.statusCode).to.equal(HttpStatus.CREATED);
        expect(response.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(adminInformation[USER_EMAIL_HEADER]);
    });
    it("Should return and error if I try to create a new Admin without speciifying the API key", async () => {
        const response = (await request(app).post(REGISTER_ADMIN_ROUTE).send(userInformation));
        expect(response.statusCode).to.equal(HttpStatus.UNAUTHORIZED);
    });
    it("After user registration, It should be possible to use the same credentials for the login", async () => {
        const response = (await request(app).post(REGISTER_USER_ROUTE).send(userInformation));
        expect(response.statusCode).to.equal(HttpStatus.CREATED);
        expect(response.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(userInformation[USER_EMAIL_HEADER]);
        const login = (await request(app).post(LOGIN_USER_ROUTE).send(userInformation));
        expect(login.statusCode).to.equal(HttpStatus.OK);
        expect(login.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(userInformation[USER_EMAIL_HEADER]);
    });
    it("After admin registration, It should be possible to use the same credentials for the login", async () => {
        const response = (await request(app).post(REGISTER_ADMIN_ROUTE).send(adminInformation));
        expect(response.statusCode).to.equal(HttpStatus.CREATED);
        expect(response.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(userInformation[USER_EMAIL_HEADER]);
        const login = (await request(app).post(LOGIN_ADMIN_ROUTE).send(adminInformation));
        expect(login.statusCode).to.equal(HttpStatus.OK);
    });
    afterEach(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
    });
});