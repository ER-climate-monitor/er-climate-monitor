import { HttpMethods } from '../../api/httpMethods';

/**
 * Generic Http Request that will be used during the API Gateway requesto to the other Service.
 */
interface HttpRequest {
    /**
    * @property {HttpMethods} method - Input Http method that will be used for doing the request.
    * @property {string} path - Service url path where our request will be redirected.
    * @property {Record<string, string>} headers - Input headers.
    * @property {object} body - Input body.
    * @property {Record<string, string>} params - Input path parameters.
    * @property {Record<string, string>} queries - Input query parameters.
    */
    method: HttpMethods;
    path: string;
    headers: Record<string, string>;
    body: object;
    params: Record<string, string>;
    queries: Record<string, string>;
}

/**
 * Basic Http Request class that implement the Http Request.
 */
class BasicHttpRequest implements HttpRequest {
    method: HttpMethods;
    path: string;
    headers: Record<string, string>;
    body: object;
    params: Record<string, string>;
    queries: Record<string, string>;

    /**
     * Initialise the Http Request
     * @param {HttpMethods} method - Input Http method that will be used for doing the request.
     * @param {string} path - Service url path where our request will be redirected.
     * @param {Record<string, string>} headers - Input headers.
     * @param {object} body - Input body.
     * @param {Record<string, string>} params - Input path parameters.
     * @param {Record<string, string>} queries - Input query parameters.
     */
    constructor(
        method: HttpMethods,
        path: string,
        headers: Record<string, string>,
        body: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ) {
        this.method = method;
        this.path = path;
        this.headers = headers;
        this.body = body;
        this.params = params;
        this.queries = queries;
    }
}

export { HttpRequest, BasicHttpRequest };
