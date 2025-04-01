import DataModel from '../schemas/data.schema';
import { IData } from "../models/data.model";

export default class DataService {


    public async getAll() {
        try {
            const data = await DataModel.find();
            return data;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async post(data: IData) {
        try {
            const newData = await DataModel.create(data);
            return newData;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async delete(id: string) {
        try {
            const data = await DataModel.findByIdAndDelete(id);
            return data ? 200 : 404;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }
}
