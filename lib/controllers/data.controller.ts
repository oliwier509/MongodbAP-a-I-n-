import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';

let testArr1 = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6]; //latest data
let testArr2 = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,7]; //latest data
let testArr3 = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,8]; //latest data
let testArr4 = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,9]; //latest data
let testArr5 = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,10]; //latest data

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    
 
    constructor() {
        this.initializeRoutes();
        console.log("Routes running")
    }
 
    private initializeRoutes() {
        this.router.get(this.path + '/latest', this.getLatestReadingsFromAllDevices);
        this.router.post(this.path + '/add', this.addData);
        this.router.get(this.path + '/:id', this.getDataByID);
        this.router.get(this.path + '/:id/:num', this.getDataInBulk);
        this.router.delete(this.path + '/all', this.deleteAll);
        this.router.delete(this.path + '/:id', this.deleteDataByID);
    }

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        let output = [];
        output[0] = testArr1[testArr1.length - 1];
        output[1] = testArr2[testArr2.length - 1];
        output[2] = testArr3[testArr3.length - 1];
        output[3] = testArr4[testArr4.length - 1];
        output[4] = testArr5[testArr5.length - 1];

        console.log("dane: " + output);
        response.status(200).json(output);
    };

    //dev only
    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { elem } = request.body;
        testArr1.push(elem);
        response.status(200).json("DATA ADDED");
    };
     
 
    //rel

    private getDataByID = async (request: Request, response: Response, next: NextFunction) => {
        const id = Number(request.params.id);
        let output = []
        output[0] = testArr1[id];
        output[1] = testArr2[id];
        output[2] = testArr3[id];
        output[3] = testArr4[id];
        output[4] = testArr5[id];
        console.log("dane: " + output);
        response.status(200).json(output);
    };

    private getDataInBulk = async (request: Request, response: Response, next: NextFunction) => {
        let output = []
        const id = Number(request.params.id);
        const num = Number(request.params.num);
        output[0] = testArr1.slice(id,id+num);
        output[1] = testArr2.slice(id,id+num);
        output[2] = testArr3.slice(id,id+num);
        output[3] = testArr4.slice(id,id+num);
        output[4] = testArr5.slice(id,id+num);
        console.log("dane: " + output);
        response.status(200).json(output);
    };

    private deleteAll = async (request: Request, response: Response, next: NextFunction) => {
        testArr1.length = 0;
        testArr2.length = 0;
        testArr3.length = 0;
        testArr4.length = 0;
        testArr5.length = 0;
        response.status(200).json("DATA DELETED");
    };

    private deleteDataByID = async (request: Request, response: Response, next: NextFunction) => {
        const id = Number(request.params.id);
        testArr1.splice(id,1);
        testArr2.splice(id,1);
        testArr3.splice(id,1);
        testArr4.splice(id,1);
        testArr5.splice(id,1);
        response.status(200).json("DATA DELETED");
    };
 }
 
 export default DataController;
 