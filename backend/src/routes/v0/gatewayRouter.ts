import express from 'express';
import { AUTHENTICATION_PATHS } from './paths/gatewayPaths';
import { authenticationGetHandler } from '../../controllers/v0/authenticationController';
import { authentiationPostHandler } from '../../controllers/v0/authenticationController/authenticationPostController';

const gatewayRouter = express.Router();

gatewayRouter.route(AUTHENTICATION_PATHS).get(authenticationGetHandler).post(authentiationPostHandler);

export { gatewayRouter };
