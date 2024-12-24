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
const USER_JWT_TOKEN_HEADER = process.env.USER_JWT_TOKEN_HEADER || "X-User-Token"
const api_key = process.env.SECRET_API_KEY || "";

const REGISTER_USER_ROUTE = "/user/register";
const REGISTER_ADMIN_ROUTE = "/user/admin/register";
const LOGIN_USER_ROUTE = "/user/login";
const LOGIN_ADMIN_ROUTE = "/user/admin/login";
const JWT_AUTHORIZED_ROUTE = "/user/authorized";


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

describe("JWT token for registered users", () => {
    before(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
        console.log("Before all");
    });
    it("It should be possible to check the validity of a JWT token of a registered user", async () => {
        const response = (await request(app).post(REGISTER_USER_ROUTE).send(userInformation));
        expect(response.statusCode).to.equal(HttpStatus.CREATED);
        expect(response.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(userInformation[USER_EMAIL_HEADER]);
        const jwtToken = response.headers[USER_JWT_TOKEN_HEADER.toLowerCase()];
        console.log(jwtToken);
        const valid = (await request(app).post(JWT_AUTHORIZED_ROUTE).send({[USER_JWT_TOKEN_HEADER]: jwtToken}));
        expect(valid.statusCode).to.equal(HttpStatus.ACCEPTED);
    });
    afterEach(async () => {
        await deleteUser(app, userInformation);
    });
});