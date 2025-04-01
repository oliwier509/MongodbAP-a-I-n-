import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import path from 'path';
import {array} from "joi";

class ItemController implements Controller {
    public path = '/api/items';
    public router = Router();
    private arr: Number[] = [1,2,3,4,5]


    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(this.path, this.postItems);
        this.router.get(this.path, this.getItems);
        this.router.get(this.path + '/:id', this.getItem);
        this.router.put(this.path + '/:id', this.updateItem);
        this.router.delete(this.path + '/:id', this.deteteItem);
    }

    private postItems = async (request: Request, response: Response) => {
        const number = Number(request.query.number);
        this.arr.push(number);
        response.send("200");
    }

    private getItems = async (request: Request, response: Response) => {
        let output = this.arr.toString();
        response.send(output);

    }

    private getItem = async (request: Request, response: Response) => {
        const id = Number(request.params.id);
        response.send(this.arr[id].toString());

    }

    private updateItem = async (request: Request, response: Response) => {
        const number = Number(request.query.number);
        const id = Number(request.params.id);
        console.log(number)
        this.arr[id] = number;
        response.send("200");
    }

    private deteteItem = async (request: Request, response: Response) => {
        const id = Number(request.params.id);
        this.arr.splice(id, 1);
        response.send("200");
    }
}

export default ItemController;