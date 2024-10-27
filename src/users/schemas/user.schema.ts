import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class CartItem {
  save() {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema()
export class PurchasedCourse {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  createdat: string;
}

const PurchasedCourseSchema = SchemaFactory.createForClass(PurchasedCourse);

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] }) // Carrito de compras como JSON strings
  cart: string[]; // Cada string representa un curso en formato JSON

  @Prop({ type: [PurchasedCourseSchema], default: [] }) // Historial de compras con detalles completos
  purchasedCourses: PurchasedCourse[];
}

export const UserSchema = SchemaFactory.createForClass(User);
