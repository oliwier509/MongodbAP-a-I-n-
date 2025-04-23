import express from 'express';
import { config } from './config';
import Controller from "./interfaces/controller.interface";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import DataService from './modules/services/data.service';

const nicknames = new Map<string, string>();

class App {
    public app: express.Application;
    private server: http.Server;
    public io: Server;
    private dataService = new DataService();
    

    constructor(controllers: Controller[]) {
        this.app = express();
        this.server = http.createServer(this.app);

        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                allowedHeaders: ["Authorization"],
                credentials: true
            },
        });

        this.initializeMiddlewares();
        this.initializeSocket();
        this.initializeControllers(controllers);
        this.connectToDatabase();
    }
    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParser.json());
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }

    private async connectToDatabase(): Promise<void> {
        mongoose.set('debug', true);
        console.log('Połączono z bazą: ', mongoose.connection.name);
        try {
            // Próba nawiązania połączenia z bazą danych MongoDB
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            // Obsługa błędu w przypadku nieudanego połączenia
            console.error('Error connecting to MongoDB:', error);
        }

        // Obsługa błędów połączenia po jego ustanowieniu
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        // Obsługa zdarzenia rozłączenia z bazą danych
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Nasłuchiwanie sygnału zamknięcia aplikacji (np. `Ctrl + C` lub `SIGINT` w systemach UNIX)
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            // Zamknięcie połączenia z bazą danych przed zakończeniem procesu
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }

    private initializeSocket(): void {
    

        this.io.on("connection", async (socket: Socket) => {
            console.log(`Nowe połączenie: ${socket.id}`);

            const data = await this.dataService.getAll();
            socket.emit("message", data);

            setInterval(async () => {
                
                const data = await this.dataService.getAll();
                this.io.emit("message", data);
            }, 5000); //po jakimś czasie ignoruje to i robi 2 zapytania :over:

            //przykładowe dane:
            //{"temperature":500.9,"pressure":900.9,"humidity":4554.6,"deviceId":14}
            //wkleić do inputa w front-endzie
            socket.on("message", async (data: string) => {
                console.log(`Wiadomość od ${socket.id}: ${data}`);
                
                try {
                    const parsedData = JSON.parse(data);
                    const saved = await this.dataService.post(parsedData);
                    console.log("Zapisano w bazie danych:", saved);
                    this.io.emit("message", saved);
            
                } catch (err) {
                    console.error("Błąd zapisu danych:", err);
                    socket.emit("error", "Nieprawidłowe dane lub błąd zapisu.");
                }

            });

            
            socket.on("set-nickname", (nick: string) => {
                nicknames.set(socket.id, nick);
                console.log(`Użytkownik ${socket.id} ustawił nick: ${nick}`);
                updateUserList();
            });

            socket.on("private-message", ({ toSocketId, from, content }) => {
                socket.to(toSocketId).emit("private-message", { from, content });
            });

            socket.on("disconnect", () => {
                console.log(`Rozłączono: ${socket.id}`);
                nicknames.delete(socket.id);
                updateUserList();
            });

            const updateUserList = () => {
                const users = Array.from(nicknames.entries()).map(([id, nick]) => ({ socketId: id, nick }));
                this.io.emit("user-list", users);
            };
        });


        this.server.listen(config.socketPort, () => {
            console.log(`WebSocket listening on port ${config.socketPort}`);
        });
    }


    public getIo(): Server {
        return this.io;
    }
}
export default App;
