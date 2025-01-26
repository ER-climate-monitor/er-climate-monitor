interface HttpResponse {
    statusCode: number;
    headers: Record<string, string> | undefined;
    data: Record<string, string | object>;
}

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
