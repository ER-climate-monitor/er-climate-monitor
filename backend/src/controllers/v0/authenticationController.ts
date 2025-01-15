import { Request, Response } from "express"
import { breaker } from "./utils/circuitRequest"
import { AUTHENTICATION_ENDPOINT } from "../../models/v0/serviceModels"
import { GET, POST } from "./utils/httpMethods"
import { removeServiceFromUrl } from "./utils/urlUtils"
import { AUTHENTICATION_SERVICE } from "../../routes/v0/paths/gatewayPaths"
import { HttpStatusCode } from "axios"
import { authenticationRedisClient } from "./utils/redisClient"
import { fromAxiosToResponse } from "./utils/responseUtils"
import { USER_JWT_TOKEN_EXPIRATION_HEADER, USER_JWT_TOKEN_HEADER } from "../../models/v0/headers/authenticationHeaders"

const authenticationGetHandler = async (request: Request, response: Response) => {
    try {
        const url = request.url
        const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, url);
        breaker.fire(AUTHENTICATION_ENDPOINT, GET, endpointPath, request.headers, request.body);
    }catch(error) {
        console.log(error);
    }
    response.end();
}

const authentiationPostHandler = async (request: Request, response: Response) => {
    const url = request.url
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, url);
    breaker.fire(AUTHENTICATION_ENDPOINT, POST, endpointPath, request.headers, request.body)
        .then(axiosResponse => {
            response = fromAxiosToResponse(axiosResponse, response);
            if (response.statusCode === HttpStatusCode.Ok || response.statusCode === HttpStatusCode.Created) {
                authenticationRedisClient.setToken(String(response.getHeader(USER_JWT_TOKEN_HEADER)), String(response.getHeader(USER_JWT_TOKEN_EXPIRATION_HEADER)));
            }
        })
        .catch(error => {
            response.status(HttpStatusCode.BadRequest);
            response.end();
        });
}

export { authenticationGetHandler, authentiationPostHandler }