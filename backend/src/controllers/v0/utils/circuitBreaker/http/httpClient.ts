interface HttpClient<X> {
    httpGet(_endpoint: string, _headers: any): Promise<X>;
    httpPost(_endpoint: string, _headers: any, _body: any): Promise<X>;
    httpPut(_endpoint: string, _headers: any, _body: any): Promise<X>;
    httpDelete(_endpoint: string, _headers: any, _body: any): Promise<X>;
}

abstract class AbstractHttpClient<T extends HttpClient<X>, X> {
    clientTechnology: T;
    protected constructor(clientTechnology: T) {
        this.clientTechnology = clientTechnology;
    }

    private makeRequest(request: () => Promise<X>): Promise<X> {
        return request();
    }

    async getRequest(endpoint: string, headers: any): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpGet(endpoint, headers));
    }
    async postRequest(endpoint: string, headers: any, body: any): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpPost(endpoint, headers, body));
    }
    async putRequest(endpoint: string, headers: any, body: any): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpPut(endpoint, headers, body));
    }
    async deleteRequest(endpoint: string, headers: any, body: any): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpDelete(endpoint, headers, body));
    }
}

export { AbstractHttpClient, HttpClient };
