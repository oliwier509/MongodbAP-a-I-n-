import express from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import Controller from './interfaces/controller.interface';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

class App {
  public app: express.Application;
  private server: HTTPServer;
  private io: SocketIOServer;

  constructor(controllers: Controller[]) {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.connectToDatabase();
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  private initializeMiddlewares(): void {
    const logPath = path.join(__dirname, 'log.txt');
    const accessLogStream = fs.createWriteStream(logPath, { flags: 'a' });
    this.app.use(cors({
      origin: process.env.CLIENT_URL || config.clientUrl
    }));
    this.app.use(morgan('dev'));
    this.app.use(morgan('combined', { stream: accessLogStream }));
    this.app.use(bodyParser.json());
    console.log(`Middleware running`);
  }

  public listen(): void {
    this.server.listen(config.port, () => {
      console.log(`App listening on the port ${config.port}`);
    });

    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);
    });
  }

  public getIo(): SocketIOServer {
    return this.io;
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.databaseUrl);
      console.log('Connection with database established');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  }
}

export default App;