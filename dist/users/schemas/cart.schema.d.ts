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
    userId: import("mongoose").Types.ObjectId;
    courseId: import("mongoose").Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    status: string;
}, Document<unknown, {}, import("mongoose").FlatRecord<{
    userId: import("mongoose").Types.ObjectId;
    courseId: import("mongoose").Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    status: string;
}>> & import("mongoose").FlatRecord<{
    userId: import("mongoose").Types.ObjectId;
    courseId: import("mongoose").Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    status: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
