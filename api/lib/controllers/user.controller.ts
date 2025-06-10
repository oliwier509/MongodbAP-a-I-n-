/*
//dodawanie
{
	"login": "test1",
	"name": "testowy1",
	"email": "1234@test.test1",
	"password": "test1"
}
output:

{
    "email": "1234@test.test1",
    "name": "testowy1",
    "role": "adminOS",
    "active": true,
    "isAdmin": true,
    "_id": "683a0c25a0a361b082c9564f",
    "__v": 0
}

{
	"login": "test",
	"password": "test"
}

{
  "login": "1234@test.test1",
  "password": "test1"
}

{
  "login": "1234@test.test1",
  "password": "57ak1jdh"
}
*/

import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";

class UserController implements Controller {
    public path = '/api/user';
    public router = Router();
    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
        this.router.delete(`${this.path}/delete/:userId`, auth, admin, this.deleteUser);
    }

    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const { login, password } = request.body;
        try {
            console.log(login)
            console.log(password)
            const user = await this.userService.getByEmailOrName(login);
            console.log(user);
            if (!user) {
                console.log("no email?")
                return response.status(401).json({ error: 'Unauthorized' });
            }


            const isAuthorized = await this.passwordService.authorize(user._id, password);
            if (!isAuthorized) {
                console.log("wrong pass or login")
                return response.status(401).json({ error: 'Unauthorized' });
            }
    
    
            const token = await this.tokenService.create(user);
            response.status(200).json(this.tokenService.getToken(token));
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };
 
 
    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        console.log('userData', userData)
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password)
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({error: 'Bad request', value: error.message});
        }
    };
 
 
    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const {userId} = request.params;
        try {
            const result = await this.tokenService.remove(userId);
            console.log('aaa', result)
            response.status(200).json(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({error: 'Unauthorized'});
        }
    };

    private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        const { login } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(404).json({ error: 'User not found' });
            }

            const newPassword = Math.random().toString(36).slice(-8); // tak, wiem że to jest głupie, tak wiem że można tym usuwać hasła innym, nie nic z tym nie zrobie bo nie ma czasu :troll:
            const hashedPassword = await this.passwordService.hashPassword(newPassword);
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });

            console.log(`Nowe hasło dla ${user.email}: ${newPassword}`);
            response.status(200).json({ 
                message: 'Password reset successfully. Check your email.',
                newPassword
            });
        } catch (error) {
            console.error(`Password reset error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    };


    private deleteUser = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params;
        console.log(userId);
        try {
            const deleted = await this.userService.deleteById(userId);
            if (!deleted) {
                return response.status(404).json({ error: 'User not found' });
            }

            response.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(`Delete error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    };


}

export default UserController;
