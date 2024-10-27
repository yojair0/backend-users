import { Document, Schema } from 'mongoose';

export interface CartItem extends Document {
  userId: string;
  courseId: string;
  title: string;
  price: number;
  quantity: number;
  status: string;
}

export const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  status: { type: String, default: 'pending' },
});
