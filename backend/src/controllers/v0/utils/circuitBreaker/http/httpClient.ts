interface HttpClient<X> {
    httpGet(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<X>;
    httpPost(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<X>;
    httpPut(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<X>;
    httpDelete(
        _endpoint: string,
        _headers: Record<string, string>,
        _data: object,
        _params: Record<string, string>,
        _queries: Record<string, string>,
    ): Promise<X>;
}

abstract class AbstractHttpClient<T extends HttpClient<X>, X> {
    clientTechnology: T;
    protected constructor(clientTechnology: T) {
        this.clientTechnology = clientTechnology;
    }

    private makeRequest(request: () => Promise<X>): Promise<X> {
        return request();
    }

    async getRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpGet(endpoint, headers, data, params, queries));
    }
    async postRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpPost(endpoint, headers, data, params, queries));
    }
    async putRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpPut(endpoint, headers, data, params, queries));
    }
    async deleteRequest(
        endpoint: string,
        headers: Record<string, string>,
        data: object,
        params: Record<string, string>,
        queries: Record<string, string>,
    ): Promise<X> {
        return this.makeRequest(() => this.clientTechnology.httpDelete(endpoint, headers, data, params, queries));
    }
}

export { AbstractHttpClient, HttpClient };
