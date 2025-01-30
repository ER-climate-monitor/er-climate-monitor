import { HttpMethods } from "../../api/httpMethods";

/**
 * TODO: 
 */
interface HttpRequest {
    method: HttpMethods;
    path: string;
    headers: Record<string, string>;
    body: object;
    params: Record<string, string>;
    queries: Record<string, string>;
}

/**
 * TODO: 
 */
class BasicHttpRequest implements HttpRequest {
    method: HttpMethods;
    path: string;
    headers: Record<string, string>;
    body: object;
    params: Record<string, string>;
    queries: Record<string, string>;

    constructor(method: HttpMethods, path: string, headers: Record<string, string>, body: object, params: Record<string, string>, queries: Record<string, string>) {
        this.method = method;
        this.path = path;
        this.headers = headers;
        this.body = body;
        this.params = params;
        this.queries = queries;
    }

}

export { HttpRequest, BasicHttpRequest }