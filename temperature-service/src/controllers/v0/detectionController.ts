import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import dotenv from "dotenv";

const saveDetection = async (request: Request, response: Response) {
    const modelData = request.body;
    if (modelData) {
        
    }
    response.end();

}