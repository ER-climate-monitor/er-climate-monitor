import { Request, Response } from "express"
import { breaker } from "./utils/circuitRequest"
import { AUTHENTICATION_ENDPOINT } from "../../models/v0/serviceModels"
import { GET } from "./utils/httpMethods"
import { removeServiceFromUrl } from "./utils/urlUtils"
import { AUTHENTICATION_SERVICE } from "../../routes/v0/paths/gatewayPaths"


const authenticationGetHandler = async (request: Request, response: Response) => {
    const url = request.url
    const data = request.body + request.headers
    const endpointPath = removeServiceFromUrl(AUTHENTICATION_SERVICE, url);
    breaker.fire(AUTHENTICATION_ENDPOINT, GET, endpointPath, data);
    response.end();
}

export { authenticationGetHandler }