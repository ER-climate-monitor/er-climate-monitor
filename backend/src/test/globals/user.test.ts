import { expect } from "chai"
import request from "supertest"
import createServer from "../..";
import { describe, it, after } from "node:test";
import HttpStatus from "http-status-codes";
import { USER_EMAIL_HEADER, USER_PASSWORD_HEADER } from "../../controllers/userController";
import { Application, response } from "express";

const TEST_PORT = 10_000;
console.log(process.env);

const app: Application = createServer();
const server = app.listen(TEST_PORT, () => { 
    console.log("Server listening on port: ", TEST_PORT);
    app.emit("ready");
});

async function deleteUser(email: string, password: string) {
    const userInformation = {
        [USER_EMAIL_HEADER]: email,
        [USER_PASSWORD_HEADER]: password
    }
    const resopnse = (await request(app).delete("/user/delete").send(userInformation));
    expect(response.statusCode).to.equal(HttpStatus.OK);
}

app.on("ready", () => {
    describe("New User Registration", async () => {
        await it("should return OK if the email does not exists inside the Database", async () => {
            const email = "testemail1@gmail.com";
            const password = "AVeryStrongPassword1010";
            const userInformation = {
                [USER_EMAIL_HEADER]: email,
                [USER_PASSWORD_HEADER]: password
            }
            const response = (await request(app).post("/user/register").send(userInformation));
            await expect(response.statusCode).to.equal(HttpStatus.CREATED);
            await expect(response.headers[USER_EMAIL_HEADER.toLowerCase()]).to.equal(userInformation[USER_EMAIL_HEADER]);
            await deleteUser(email, password);
        });
        await it("should return an error if I try to create a new user with an email already registered", async () => {
            const email = "testemail1@gmail.com";
            const password = "AVeryStrongPassword1010";
            const userInformation = {
                [USER_EMAIL_HEADER]: email,
                [USER_PASSWORD_HEADER]: password
            };
            const response = (await request(app).post("/user/register").send(userInformation));
            const secondResponse = await request(app).post("/user/register").send(userInformation);
            await expect(response.statusCode).to.equal(HttpStatus.CREATED);
            await expect(secondResponse.statusCode).to.equal(HttpStatus.CONFLICT);
            await deleteUser(email, password);
        });
        after(() => {
            server.close(() => {
                console.log("Closing the server...");
                process.exit(0);
            });
        })
    });
});