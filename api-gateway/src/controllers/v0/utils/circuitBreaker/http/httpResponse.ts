/**
 * Interface that represents a generic Http Response received from a Service.
 * @property {number} statusCode - The http status code received from the response.
 * @property {Record<string, string> | undefined} headers - Possible input headers received from the response.
 * @property {Record<string, string | object> } data - Data received from the response.
 */ 
interface HttpResponse {
    statusCode: number;
    headers: Record<string, string> | undefined;
    data: Record<string, string | object>;
}

/**
 * Basic Implementation for an HTTP Response.
 */
class BasicHttpResponse implements HttpResponse {
    statusCode: number;
    headers: Record<string, string> | undefined;
    data: Record<string, string | object>;
    params: Record<string, string> | undefined;
    constructor(
        statusCode: number,
        headers: Record<string, string> | undefined = {},
        data: Record<string, string | object> = {},
    ) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.data = data;
    }
}

export { BasicHttpResponse, HttpResponse };
