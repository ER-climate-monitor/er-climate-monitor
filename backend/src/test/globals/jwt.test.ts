import request from "supertest"
import createServer from "../..";
import { describe, it, afterEach } from "mocha";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_HEADER, USER_PASSWORD_HEADER } from "../../controllers/userController";
import { Application } from "express";
import { deleteAdmin, deleteUser } from "./utils/userUtils";

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
    });
    it("It should be possible to check the validity of a JWT token of a registered user", async () => {
        const response = await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(userInformation)
            .expect(HttpStatus.CREATED)
        const jwtToken = response.headers[USER_JWT_TOKEN_HEADER.toLowerCase()];
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send({[USER_JWT_TOKEN_HEADER]: jwtToken})
            .expect(HttpStatus.ACCEPTED);
    });
    it("It should be possible to check the validity of a JWT token of a registered admin", async () => {
        const response = await request(app)
            .post(REGISTER_ADMIN_ROUTE)
            .send(adminInformation)
            .expect(HttpStatus.CREATED)
        const jwtToken = response.headers[USER_JWT_TOKEN_HEADER.toLowerCase()];
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send({[USER_JWT_TOKEN_HEADER]: jwtToken})
            .expect(HttpStatus.ACCEPTED);
    });
    it("It should return an error if I try to verify a token that does not exists and also It is bad formatted", async () => {
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send({[USER_JWT_TOKEN_HEADER]: "TOKEForzaNapoliKvichaKvaraskelia"})
            .expect(HttpStatus.BAD_REQUEST);
    });
    it("It should return an error if I try to verify a token well formatted but that It is not created by this server", async () => {
        const jwt = "qyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiVHVlIERlYyAyNCAyMDI0IDE2OjA0OjM2IEdNVCswMTAwIChDZW50cmFsIEV1cm9wZWFuIFN0YW5kYXJkIFRpbWUpIiwiaWF0IjoxNzM1MDUyNjc2fQ.0z5NC4qn2566V9uwtLeWuwffRoM3lbtr6JCJA3Jp5Gs";
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send({[USER_JWT_TOKEN_HEADER]: jwt})
            .expect(HttpStatus.BAD_REQUEST);
    });
    afterEach(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
    });
});