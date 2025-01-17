import express from 'express';
import { AUTHENTICATION_PATHS } from './paths/gatewayPaths';
import { authentiationPostHandler } from '../../controllers/v0/authenticationController/authenticationPostController';

const gatewayRouter = express.Router();

gatewayRouter.route(AUTHENTICATION_PATHS).post(authentiationPostHandler);

export { gatewayRouter };
