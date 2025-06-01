import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import path from 'path';
import { Server } from "socket.io";

class IndexController implements Controller {
   public path = '/*';
   public router = Router();
   private io: Server;

   constructor(io: Server) {
        this.io = io;
        this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.get(this.path, this.serveIndex);
   }

   private serveIndex = async (request: Request, response: Response) => {
       response.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
   }
}

export default IndexController;