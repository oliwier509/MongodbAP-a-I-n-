import mongoose, { Schema, Model } from 'mongoose';

export interface IPassword {
   userId: Schema.Types.ObjectId;
   password: string;
}

const PasswordSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, unique: true },
    password: { type: String, required: true }
    });
    
    const PasswordModel: Model<IPassword> = mongoose.model<IPassword>('Password', PasswordSchema);

    export default PasswordModel;