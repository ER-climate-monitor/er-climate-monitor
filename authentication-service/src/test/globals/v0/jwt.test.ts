import request from 'supertest';
import { createTestServer, dropTestDatabase } from '../../../appUtils';
import { describe, it } from 'mocha';
import HttpStatus from 'http-status-codes';
import {
    API_KEY_HEADER,
    USER_EMAIL_FIELD,
    USER_PASSWORD_FIELD,
    USER_JWT_TOKEN_EXPIRATION_FIELD,
    USER_JWT_TOKEN_FIELD,
} from '../../../models/v0/headers/userHeaders';
import { Application } from 'express';
import { createBodyUser, deleteAdmin, deleteUser } from './utils/userUtils';
import { fail } from 'assert';
import { REGISTER_ADMIN_ROUTE, REGISTER_USER_ROUTE, JWT_AUTHORIZED_ROUTE } from './routes/globalRoutes.v0';
import { AUTHENTICATE, REGISTER } from '../../../controllers/v0/utils/userActions';

const email = 'testemail1@gmail.com';
const password = 'Forzanapoli10!';
const api_key = process.env.SECRET_API_KEY || '';

const userInformation = {
    [USER_EMAIL_FIELD]: email,
    [USER_PASSWORD_FIELD]: password,
};

const adminInformation = {
    [USER_EMAIL_FIELD]: email,
    [USER_PASSWORD_FIELD]: password,
};

const app: Application = createTestServer();

describe('JWT token for registered users', () => {
    beforeEach(async () => {
        await deleteUser(app, userInformation);
        await deleteAdmin(app, adminInformation);
    });
    it('After creating a JWT token It should be possible to also check the validity of the created token', async () => {
        const response = await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(createBodyUser(REGISTER, userInformation))
            .expect(HttpStatus.CREATED);
        if (!(USER_JWT_TOKEN_EXPIRATION_FIELD in response.body)) {
            fail();
        }
    });
    it('It should be possible to check the validity of a JWT token of a registered user', async () => {
        const response = await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(createBodyUser(REGISTER, userInformation))
            .expect(HttpStatus.CREATED);
        const jwtToken = response.body[USER_JWT_TOKEN_FIELD];
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send(createBodyUser(AUTHENTICATE, { [USER_JWT_TOKEN_FIELD]: jwtToken }))
            .expect(HttpStatus.ACCEPTED);
    });
    it('It should be possible to check the validity of a JWT token of a registered admin', async () => {
        const response = await request(app)
            .post(REGISTER_ADMIN_ROUTE)
            .send(createBodyUser(REGISTER, adminInformation))
            .set(API_KEY_HEADER, api_key)
            .expect(HttpStatus.CREATED);
        const jwtToken = response.body[USER_JWT_TOKEN_FIELD];
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send(createBodyUser(AUTHENTICATE, { [USER_JWT_TOKEN_FIELD]: jwtToken }))
            .expect(HttpStatus.ACCEPTED);
    });
    it('It should return an error if I try to verify a token that does not exists and also It is bad formatted', async () => {
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send(createBodyUser(AUTHENTICATE, { [USER_JWT_TOKEN_FIELD]: 'TOKEForzaNapoliKvichaKvaraskelia' }))
            .expect(HttpStatus.BAD_REQUEST);
    });
    it('It should return an error if I try to verify a token well formatted but that It is not created by this server', async () => {
        const jwt =
            'qyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiVHVlIERlYyAyNCAyMDI0IDE2OjA0OjM2IEdNVCswMTAwIChDZW50cmFsIEV1cm9wZWFuIFN0YW5kYXJkIFRpbWUpIiwiaWF0IjoxNzM1MDUyNjc2fQ.0z5NC4qn2566V9uwtLeWuwffRoM3lbtr6JCJA3Jp5Gs';
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send(createBodyUser(AUTHENTICATE, { [USER_JWT_TOKEN_FIELD]: jwt }))
            .expect(HttpStatus.BAD_REQUEST);
    });
    it('Should return an error if the JWT token is valid but It has expired.', async () => {
        const expireNow = '0';
        const oldExpiration = process.env.EXPIRATION;
        process.env.EXPIRATION = expireNow;
        const response = await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(createBodyUser(REGISTER, userInformation))
            .expect(HttpStatus.CREATED);
        const jwtToken = response.body[USER_JWT_TOKEN_FIELD];
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send(createBodyUser(AUTHENTICATE, { [USER_JWT_TOKEN_FIELD]: jwtToken }))
            .expect(HttpStatus.UNAUTHORIZED);
        process.env.EXPIRATION = oldExpiration;
    });
    it('Should return an error if I try verify the JWT token of a deleted user', async () => {
        const response = await request(app)
            .post(REGISTER_USER_ROUTE)
            .send(createBodyUser(REGISTER, userInformation))
            .expect(HttpStatus.CREATED);
        const jwtToken = response.body[USER_JWT_TOKEN_FIELD];
        await deleteUser(app, userInformation);
        await request(app)
            .post(JWT_AUTHORIZED_ROUTE)
            .send(createBodyUser(AUTHENTICATE, { [USER_JWT_TOKEN_FIELD]: jwtToken }))
            .expect(HttpStatus.UNAUTHORIZED);
    });

    after(async () => {
        await dropTestDatabase();
    });
});
