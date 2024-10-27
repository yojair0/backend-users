import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RabbitMQClientService implements OnModuleInit, OnModuleDestroy {
    private readonly RABBITMQ_URL;
    private connection;
    private channel;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private ensureChannel;
    emitToQueue(queue: string, payload: any): Promise<void>;
    sendToQueue(queue: string, payload: any): Promise<any>;
    getCourseFromQueue(courseId: string): Promise<any>;
    close(): Promise<void>;
}
