import { AxiosResponse } from 'axios';
import { Response } from 'express';

function fromAxiosToResponse(axiosResponse: AxiosResponse<any, any>, response: Response): Response {
    for (const header in axiosResponse.headers) {
        response.setHeader(header, axiosResponse.headers[header]);
    }
    response.status(axiosResponse.status);
    return response;
}

export { fromAxiosToResponse };
