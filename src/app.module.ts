import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el módulo esté disponible globalmente
    }),
    MongooseModule.forRoot(process.env.MONGO_URI), // Conexión a MongoDB usando el env
    UsersModule,
  ],
})
export class AppModule {}
