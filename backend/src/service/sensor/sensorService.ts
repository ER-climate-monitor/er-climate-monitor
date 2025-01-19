interface SensorOperations<X> {
    registerOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
    getAllSensorsOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
    deleteOperation(_endpointPath: string, _headers: any, _body: any): Promise<X>;
}