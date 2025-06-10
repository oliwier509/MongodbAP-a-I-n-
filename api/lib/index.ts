import App from './app';
import IndexController from "./controllers/index.controller";
import DataController from "./controllers/data.controller";
import UserController from "./controllers/user.controller";
import DataService from "./modules/services/data.service";
import Controller from "./interfaces/controller.interface";
import { Server as IOServer } from 'socket.io';

const app: App = new App([]);
const io = app.getIo();
const dataService = new DataService();

function createControllers(io: IOServer): Controller[] {
   return [
     new DataController(dataService, io),
     new UserController(),
     new IndexController(io)
   ];
 }

const controllers = createControllers(io);
controllers.forEach((controller) => {
  app.app.use("/", controller.router);
});

io.on('connection', async (socket) => {
  console.log(`Client connected: ${socket.id}`);

  try {
    for (let deviceId = 0; deviceId < 16; deviceId++) {
      const data = await dataService.query(deviceId.toString());
      const sorted = data.sort((a, b) => new Date(b.readingDate!).getTime() - new Date(a.readingDate!).getTime());
      const latest = sorted[0];

      if (latest) {
        socket.emit('new_device_data', {
          deviceId,
          data: {
            temperature: latest.temperature.toFixed(1),
            pressure: latest.pressure.toFixed(1),
            humidity: latest.humidity.toFixed(1),
            readingDate: latest.readingDate,
          }
        });
      }
    }
  } catch (error) {
    console.error('Error emitting initial device data:', error);
  }
});

app.listen();