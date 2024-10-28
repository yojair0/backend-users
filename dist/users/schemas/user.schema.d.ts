import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class CartItem {
    save(): void;
    courseId: string;
    title: string;
    price: number;
    quantity: number;
}
export declare class PurchasedCourse {
    _id: string;
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    createdat: string;
}
export declare class User extends Document {
    username: string;
    email: string;
    password: string;
    cart: string[];
    purchasedCourses: PurchasedCourse[];
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: unknown;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: unknown;
}>>;
