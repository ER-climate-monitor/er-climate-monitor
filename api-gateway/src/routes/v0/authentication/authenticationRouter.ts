import express from 'express';
import { AUTHENTICATION_PATHS } from '../paths/gatewayPaths';
import { authentiationPostHandler } from '../../../controllers/v0/domain/authentication/authenticationPostController';
import { authenticationDeleteHandler } from '../../../controllers/v0/domain/authentication/authenticationDeleteController';

const authenticationRouter = express.Router();

authenticationRouter.route(AUTHENTICATION_PATHS).post(authentiationPostHandler).delete(authenticationDeleteHandler);

export { authenticationRouter };
