import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
export declare class RabbitMQClientService implements OnModuleInit {
    private readonly userModel;
    private client;
    private readonly RABBITMQ_URL;
    constructor(userModel: Model<any>);
    onModuleInit(): void;
    emitToQueue(pattern: string, payload: any): Promise<void>;
    sendToQueue(pattern: string, payload: any): Promise<any>;
    getCourseFromQueue(courseId: string): Promise<any>;
}
