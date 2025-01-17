import express from "express"
import { authenticationRouter } from "./authentication/authenticationRouter";

const gatewayRouter = express.Router();

gatewayRouter.use(authenticationRouter);

export { gatewayRouter }