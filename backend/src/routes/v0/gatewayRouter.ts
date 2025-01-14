import express from "express";
import { AUTHENTICATION_PATHS } from "./paths/gatewayPaths";
import { authenticationGetHandler } from "../../controllers/v0/gatewayController";

const gatewayRouter = express.Router();

gatewayRouter.route(AUTHENTICATION_PATHS)
    .get(authenticationGetHandler)

export { gatewayRouter }