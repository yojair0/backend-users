import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
// rabbitmq-client.service.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as amqp from 'amqplib/callback_api';
@Injectable()
export class RabbitMQClientService implements OnModuleInit {
  private client: ClientProxy;  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;

  constructor(@InjectModel('User') private readonly userModel: Model<any>) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'users_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async emitToQueue(pattern: string, payload: any): Promise<void> {
    this.client.emit(pattern, payload);
  }

  async sendToQueue(pattern: string, payload: any): Promise<any> {
    try {
      return await this.client.send(pattern, payload)
        .pipe(timeout(5000))  // Incrementa el timeout a 10 segundos
        .toPromise();
    } catch (error) {
      console.error('Error al enviar mensaje a la cola:', error);
      throw new Error('Error al obtener los detalles del curso');
    }
  }

async getCourseFromQueue(courseId: string) {
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

  await new Promise(resolve => setTimeout(resolve, 2000)); // Simula espera de mensaje

  await channel.close();
  await connection.close();

  return course;
}
}
