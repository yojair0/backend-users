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
  quantity: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] }) // Carrito de compras como JSON strings
  cart: string[]; // Cada string representa un curso en formato JSON

  @Prop({ type: [String], default: [] }) // Historial de compras, solo los IDs de los cursos
  purchasedCourses: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
