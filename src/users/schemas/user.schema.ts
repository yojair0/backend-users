import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class CartItem {
  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [CartItemSchema], default: [] }) // Carrito de compras
  cart: CartItem[];

  @Prop({ type: [String], default: [] }) // Historial de compras, solo los IDs de los cursos
  purchasedCourses: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
