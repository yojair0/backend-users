import { Document, Schema } from 'mongoose';
export interface CartItem extends Document {
    userId: string;
    courseId: string;
    title: string;
    price: number;
    quantity: number;
    status: string;
}
export declare const CartSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    courseId: import("mongoose").Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    userId: import("mongoose").Types.ObjectId;
    status: string;
}, Document<unknown, {}, import("mongoose").FlatRecord<{
    courseId: import("mongoose").Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    userId: import("mongoose").Types.ObjectId;
    status: string;
}>> & import("mongoose").FlatRecord<{
    courseId: import("mongoose").Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    userId: import("mongoose").Types.ObjectId;
    status: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
