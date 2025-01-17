import { AxiosResponse, AxiosError } from 'axios';
import { Response } from 'express';

function fromAxiosToResponse(axiosResponse: AxiosResponse<any, any>, response: Response): Response {
    for (const header in axiosResponse.headers) {
        response.setHeader(header, axiosResponse.headers[header]);
    }
    response.status(axiosResponse.status);
    return response;
}

function handleAxiosError(error: AxiosError<unknown, unknown>, response: Response) {
    if (error.response !== undefined) {
        response = fromAxiosToResponse(error.response, response);
        response.send(error.response.data);
    }
    return response;
}

export { fromAxiosToResponse, handleAxiosError };
