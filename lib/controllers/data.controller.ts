    //dane do testowania:
    /*
    {
        "air": [
            {
                "id": 1,
                "value": 4.6
            },
            {
                "id": 2,
                "value": 5.3
            },
            {
                "id": 3,
                "value": 7.4
            }
        ]
    }
    */
    import Controller from '../interfaces/controller.interface';
    import { Request, Response, NextFunction, Router } from 'express';
    import DataService from '../modules/services/data.service';
    import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
    
    class DataController implements Controller {
        public path = '/api/data';
        public router = Router();
        private dataService = new DataService();
    
        constructor() {
            this.initializeRoutes();
            console.log("Routes running");
        }
    
        private initializeRoutes() {
            this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
            this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
            this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);
            this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getPeriodData);
            this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getPeriodData);
            this.router.delete(`${this.path}/all`, this.cleanAllDevices);
            this.router.delete(`${this.path}/:id`, checkIdParam, this.cleanDeviceData);
        }
    
        /*
        private getLatestDeviceData = async (
            request: Request,
            response: Response,
            next: NextFunction
        ) => {
            try {
                const { id } = request.params;
                const data = await this.dataService.get(id);
                if (data) {
                    response.status(200).json(data);
                } else {
                    response.status(404).json({ message: 'No data found for device.' });
                }
            } catch (error) {
                console.error('Error retrieving latest device data:', error);
                response.status(500).json({ error: 'Internal server error' });
            }
        };
        */
    
        private getLatestReadingsFromAllDevices = async (
            request: Request,
            response: Response,
            next: NextFunction
        ) => {
            try {
                const data = await this.dataService.getAllNewest();
                response.status(200).json(data);
            } catch (error) {
                console.error('Error retrieving all latest device data:', error);
                response.status(500).json({ error: 'Internal server error' });
            }
        };
    
        private addData = async (req: Request, res: Response, next: NextFunction) => {
            const { air } = req.body;
            const { id } = req.params;
    
            const data = {
                temperature: air[0].value,
                pressure: air[1].value,
                humidity: air[2].value,
                deviceId: id,
                readingDate: new Date()
            };
    
            try {
                await this.dataService.createData(data);
                res.status(200).json(data);
            } catch (error) {
                console.error(`Validation Error: ${error.message}`);
                res.status(400).json({ error: 'Invalid input data.' });
            }
        };
    
        private getAllDeviceData = async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const allData = await this.dataService.query(id);
            res.status(200).json(allData);
        };
    
        //getLatestDeviceData jest deprecated, można handlować /:id/latest i /:id/:num tutaj
        private getPeriodData = async (req: Request, res: Response, next: NextFunction) => {
            const { id, num } = req.params;
            const count = num ? Number(num) : 1;
            try {
                const data = await this.dataService.query(id);
                const sortedData = data.sort((a, b) => new Date(b.readingDate!).getTime() - new Date(a.readingDate!).getTime());
                const recent = sortedData.slice(0, count);
                res.status(200).json(recent);
            } catch (error) {
                console.error(`Error fetching period data for device ${id}:`, error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        
        private cleanAllDevices = async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.dataService.deleteData("all");
                res.status(200).json("All device data deleted.");
            } catch (error) {
                console.error("Error deleting all device data:", error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        
        private cleanDeviceData = async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            try {
                const status = await this.dataService.deleteData(id);
                if (status === 200) {
                    res.status(200).json("Device data deleted.");
                } else {
                    res.status(404).json({ error: 'Device not found or no data to delete.' });
                }
            } catch (error) {
                console.error(`Error deleting data for device ${id}:`, error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
    }
    
    export default DataController;