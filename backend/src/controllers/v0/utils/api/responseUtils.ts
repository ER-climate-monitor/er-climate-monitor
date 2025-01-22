import { Response } from 'express';
import { HttpResponse } from '../circuitBreaker/http/httpResponse';

function fromHttpResponseToExpressResponse(httpResponse: HttpResponse, response: Response): Response {
    for (const header in httpResponse.headers) {
        response.setHeader(header, httpResponse.headers[header]);
    }
    response.status(httpResponse.statusCode);
    return response;
}

function handleError(error: HttpResponse, response: Response) {
    response = fromHttpResponseToExpressResponse(error, response);
    response.send(error.data);
    return response;
}

export { fromHttpResponseToExpressResponse, handleError };
