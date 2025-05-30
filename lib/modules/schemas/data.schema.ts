import { Schema, model } from 'mongoose';
import { IData } from "../models/data.model";

export const DataSchema: Schema = new Schema({
   temperature: { type: Number, required: true },
   pressure: { type: Number, required: true },
   humidity: { type: Number, required: true },
   deviceId: {type: String, required: true},
   readingDate: { type: Date, default: Date.now }
});

export default model<IData>('Params', DataSchema);