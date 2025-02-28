import { Response } from 'express';
import { HttpResponse } from '../circuitBreaker/http/httpResponse';

/**
 * Convert the input HttpResponse into the Express Response.
 * @param {HttpResponse} httpResponse - Input Http Response to convert
 * @param {Response} response - Output response where all the information will be saved.
 * @returns {Response} the new response to return.
 */
function fromHttpResponseToExpressResponse(httpResponse: HttpResponse, response: Response): Response {
    for (const header in httpResponse.headers) {
        response.setHeader(header, httpResponse.headers[header]);
    }
    response.status(httpResponse.statusCode);
    return response;
}

/**
 * Handle Http Response that contains all the error information, this response will be converted into a Express Response.
 * @param {HttpResponse} error - HttpResponse containing the error.
 * @param {Response} response - Output response where all the information will be saved.
 * @returns {Response} the new response to return.
 */
function handleError(error: HttpResponse, response: Response) {
    response = fromHttpResponseToExpressResponse(error, response);
    response.send(error.data);
    return response;
}

export { fromHttpResponseToExpressResponse, handleError };
