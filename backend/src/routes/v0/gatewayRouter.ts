import express from "express";
import { AUTHENTICATION_PATHS } from "./paths/gatewayPaths";
import { authentiationPostHandler, authenticationGetHandler } from "../../controllers/v0/gatewayController";

const gatewayRouter = express.Router();

gatewayRouter.route(AUTHENTICATION_PATHS)
    .get(authenticationGetHandler)
    .post(authentiationPostHandler)

export { gatewayRouter }