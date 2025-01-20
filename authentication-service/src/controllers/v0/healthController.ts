import { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';

const health = (request: Request, response: Response) => {
    response.status(HttpStatus.OK);
    response.end();
};

export { health };
