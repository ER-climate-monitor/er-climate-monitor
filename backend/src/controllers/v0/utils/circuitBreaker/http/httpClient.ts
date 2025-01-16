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
    getRequest(endpoint: string, headers: any): X {
    }
    postRequest(endpoint: string, headers: any, body: any): X {

    }
    putRequest(endpoint: string, headers: any, body: any): X {

    }
    deleteRequest(endpoint: string, headers: any, body: any): X {
        
    }
}

export { HttpClient }