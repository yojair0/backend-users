import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class CartItem {
    save(): void;
    courseId: string;
    title: string;
    price: number;
    quantity: number;
}
export declare class User extends Document {
    email: string;
    password: string;
    cart: string[];
    purchasedCourses: string[];
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: unknown;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}>>;
