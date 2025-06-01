import App from './app';
import IndexController from "./controllers/index.controller";
import DataController from "./controllers/data.controller";
import UserController from "./controllers/user.controller";
import DataService from "./modules/services/data.service";
import {Server} from "socket.io";
import Controller from "./interfaces/controller.interface";

const app: App = new App([]);
const io = app.getIo();

function createControllers(io: Server): Controller[] {
   const dataService = new DataService();


   return [
       new DataController(dataService),
       new UserController(),
       new IndexController(io)
   ];
}
const controllers = createControllers(io);
controllers.forEach((controller) => {
   app.app.use("/", controller.router);
});

/*
const app: App = new App([
   new UserController(),
   new DataController(dataService),
   new IndexController()
]);
*/

app.listen();