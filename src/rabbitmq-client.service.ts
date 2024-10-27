import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQClientService implements OnModuleInit, OnModuleDestroy {
  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Declarar colas
      await this.channel.assertQueue('users_queue', { durable: true });
      await this.channel.assertQueue('user_response_queue', { durable: false });

      this.connection.on('close', () => {
        console.error('Conexión de RabbitMQ cerrada. Intentando reconectar...');
        setTimeout(() => this.connect(), 1000);
      });

      this.connection.on('error', (err) => {
        console.error('Error en la conexión de RabbitMQ:', err);
      });

      console.log('Conexión a RabbitMQ exitosa');
    } catch (error) {
      console.error('Error al conectar a RabbitMQ:', error);
      setTimeout(() => this.connect(), 1000);
    }
  }

  private async ensureChannel() {
    if (!this.channel || this.channel.connection === null) {
      console.warn('Canal no disponible. Intentando reconectar el canal...');
      await this.connect();
    }
  }

  async emitToQueue(queue: string, payload: any): Promise<void> {
    await this.ensureChannel();
    const messageBuffer = Buffer.from(JSON.stringify(payload));
    await this.channel.sendToQueue(queue, messageBuffer);
    console.log(`Mensaje emitido a la cola ${queue}`);
  }

  async sendToQueue(queue: string, payload: any): Promise<any> {
    await this.ensureChannel();
    const correlationId = Math.random().toString(16).slice(2);
    const responseQueue = 'user_response_queue';

    const messageBuffer = Buffer.from(JSON.stringify(payload));
    console.log(`Enviando mensaje a ${queue} con correlationId ${correlationId}`);

    return new Promise(async (resolve, reject) => {
        await this.channel.sendToQueue(queue, messageBuffer, {
            correlationId,
            replyTo: responseQueue,
        });

        const responseTimeout = setTimeout(() => {
            reject(new Error('Timeout al esperar la respuesta del curso'));
        }, 10000);

        const consumerTag = await this.channel.consume(
            responseQueue,
            (msg) => {
                if (msg && msg.properties.correlationId === correlationId) {
                    clearTimeout(responseTimeout);
                    const response = JSON.parse(msg.content.toString());
                    this.channel.ack(msg);
                    console.log(`Respuesta recibida con correlationId ${correlationId}`);
                    this.channel.cancel(consumerTag.consumerTag); // Cancelar el consumidor después de recibir la respuesta
                    resolve(response);
                }
            },
            { noAck: false },
        );
    });
}


  async getCourseFromQueue(courseId: string): Promise<any> {
    try {
      const response = await this.sendToQueue('get_course_details', { courseId });
      console.log('Detalles del curso obtenidos:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener el curso desde la cola:', error);
      throw new Error('No se pudo obtener el curso desde la cola');
    }
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
