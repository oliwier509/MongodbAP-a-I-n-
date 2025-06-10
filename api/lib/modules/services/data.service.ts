import DataModel from '../schemas/data.schema';
import {IData, Query} from "../models/data.model";

export default class DataService {

public async createData(dataParams: IData) {
   try {
       const dataModel = new DataModel(dataParams);
       await dataModel.save();
   } catch (error) {
       console.error(error)
       console.error('Wystąpił błąd podczas tworzenia danych:', error);
       throw new Error('Wystąpił błąd podczas tworzenia danych');
   }
}

public async query(deviceID: string) {
   try {
       const data = await DataModel.find({deviceId: deviceID}, { __v: 0, _id: 0 });
       return data;
    } catch (error) {
        throw new Error(`Query failed: ${error}`);
    }
}

public async get(deviceId?: string) {
    try {
        if (deviceId) {
            const data = await DataModel
                .find({ deviceId: Number(deviceId) }, { __v: 0, _id: 0 })
                .sort({ readingDate: -1 })
                .limit(1);
            return data[0] ?? null;
        }

        const data = await DataModel.find({}, { __v: 0, _id: 0 });
        return data;
    } catch (error) {
        throw new Error(`Query failed: ${error}`);
    }
}

public async getAllNewest() {
    try {
        const allDeviceIds = await DataModel.distinct("deviceId");
        const latestData = await Promise.all(
            allDeviceIds.map(async (id) => {
                const latestEntry = await DataModel
                    .find({ deviceId: id }, { __v: 0, _id: 0 })
                    .sort({ readingDate: -1 })
                    .limit(1);
                return latestEntry[0] ?? { deviceId: id };
            })
        );
        return latestData;
    } catch (error) {
        throw new Error(`Query failed: ${error}`);
    }
}

public async deleteData(id: string) {
    try {
        if (id === "all") {
            await DataModel.deleteMany({});
            return 200;
        }

        const result = await DataModel.deleteMany({ deviceId: Number(id) });
        return result.deletedCount && result.deletedCount > 0 ? 200 : 404;
    } catch (error) {
        throw new Error(`Query failed: ${error}`);
    }
}

}
 