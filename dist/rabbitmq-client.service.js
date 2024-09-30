"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQClientService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const operators_1 = require("rxjs/operators");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const amqp = require("amqplib/callback_api");
let RabbitMQClientService = class RabbitMQClientService {
    constructor(userModel) {
        this.userModel = userModel;
        this.RABBITMQ_URL = process.env.RABBITMQ_URL;
    }
    onModuleInit() {
        this.client = microservices_1.ClientProxyFactory.create({
            transport: microservices_1.Transport.RMQ,
            options: {
                urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                queue: 'users_queue',
                queueOptions: {
                    durable: true,
                },
            },
        });
    }
    async emitToQueue(pattern, payload) {
        this.client.emit(pattern, payload);
    }
    async sendToQueue(pattern, payload) {
        try {
            return await this.client.send(pattern, payload)
                .pipe((0, operators_1.timeout)(5000))
                .toPromise();
        }
        catch (error) {
            console.error('Error al enviar mensaje a la cola:', error);
            throw new Error('Error al obtener los detalles del curso');
        }
    }
    async getCourseFromQueue(courseId) {
        const connection = await amqp.connect(this.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'cart_queue';
        await channel.assertQueue(queue, { durable: false });
        let course;
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                if (content.course && content.course.courseId === courseId) {
                    course = content.course;
                }
                channel.ack(msg);
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await channel.close();
        await connection.close();
        return course;
    }
};
exports.RabbitMQClientService = RabbitMQClientService;
exports.RabbitMQClientService = RabbitMQClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RabbitMQClientService);
//# sourceMappingURL=rabbitmq-client.service.js.map