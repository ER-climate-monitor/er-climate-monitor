import { Request, Response } from "express"
import { breaker } from "./utils/circuitRequest"
import { AUTHENTICATION_ENDPOINT } from "../../models/v0/serviceModels"
import { GET, POST } from "./utils/httpMethods"
import { removeServiceFromUrl } from "./utils/urlUtils"
import { AUTHENTICATION_SERVICE } from "../../routes/v0/paths/gatewayPaths"
import { HttpStatusCode } from "axios"


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
        .then()
        .catch(error => {
            response.status(HttpStatusCode.BadRequest);
            response.end();
        });
}

export { authenticationGetHandler, authentiationPostHandler }