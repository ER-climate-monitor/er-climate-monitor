interface HttpClient<X> {
    httpGet(endpoint: string, headers: any): Promise<X>
    httpPost(endpoint: string, headers: any, body: any): Promise<X>
    httpPut(endpoint: string, headers: any, body: any): Promise<X>
    httpDelete(endpoint: string, headers: any, body: any): Promise<X>
}

abstract class AbstractHttpClient<T extends HttpClient<X>, X> {
    clientTechnology: T;
    protected constructor(clientTechnology: T) {
        this.clientTechnology = clientTechnology;
    }

    private makeRequest(request: () => Promise<X> ): Promise<X> {
        try {
            return request();
        }catch(error) {
            throw error;
        }
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

export { AbstractHttpClient, HttpClient }