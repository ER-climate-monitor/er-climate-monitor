interface HttpClient<X> {
    get(endpoint: string, headers: any): X
    post(endpoint: string, headers: any, body: any): X
    put(endpoint: string, headers: any, body: any): X
    delete(endpoint: string, headers: any, body: any): X 
}

abstract class AbstractHttpClient<T extends HttpClient<X>, X> {
    clientTechnology: T;
    protected constructor(clientTechnology: T) {
        this.clientTechnology = clientTechnology;
    }

    private makeRequest(request: () => X): X {
        try {
            return request();
        }catch(error) {
            throw error;
        }
    }

    getRequest(endpoint: string, headers: any): X {
        return this.makeRequest(() => this.clientTechnology.get(endpoint, headers));
    }
    postRequest(endpoint: string, headers: any, body: any): X {
        return this.clientTechnology.put(endpoint, headers, body);
    }
    putRequest(endpoint: string, headers: any, body: any): X {

    }
    deleteRequest(endpoint: string, headers: any, body: any): X {

    }
}

export { HttpClient }