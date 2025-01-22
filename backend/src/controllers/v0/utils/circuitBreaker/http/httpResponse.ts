interface HttpResponse {
    headers: Record<string, string>,
    data: object,
    params: Record<string, string>
}

class BasicHttpResponse implements HttpResponse {
    headers: Record<string, string>;
    data: object;
    params: Record<string, string>;
    constructor(headers: Record<string, string>, data: object, params: Record<string, string>) {
        this.headers = headers;
        this.data = data;
        this.params = params;
    }
}

export { BasicHttpResponse, HttpResponse }