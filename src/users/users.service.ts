import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, CartItem } from './schemas/user.schema'; // Importamos el esquema
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RabbitMQClientService } from '../rabbitmq-client.service'; // Servicio RabbitMQ

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private rabbitMQClientService: RabbitMQClientService, // Inyecta el servicio
  ) {}

  // Registro de usuarios con RabbitMQ
  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ ...createUserDto, password: hashedPassword });
    
    const savedUser = await user.save();

    // Enviar un mensaje a RabbitMQ después de registrar el usuario
    await this.rabbitMQClientService.emitToQueue('user_created', savedUser);

    return savedUser;
  }

  // Inicio de sesión con generación de token JWT
  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid email or password');
    }

    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Actualizar usuario
  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // Obtener el historial de compras del usuario
  async getPurchaseHistory(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).select('purchasedCourses');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.purchasedCourses; // Asegúrate de que purchasedCourses está bien definido
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async addToCart(userId: string, courseId: string) {
    // Log para verificar que entra en el método
    console.log(`Añadiendo curso ${courseId} al carrito del usuario ${userId}`);
  
    try {
      // Enviar mensaje a RabbitMQ para obtener los detalles del curso
      const courseDetails = await this.rabbitMQClientService.sendToQueue('get_course_details', { courseId });
  
      // Log para verificar si hay detalles del curso
      console.log(`Detalles del curso:`, courseDetails);
  
      if (courseDetails) {
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        user.cart.push({
          courseId: courseDetails.courseId,
          title: courseDetails.title,
          price: courseDetails.price,
        });
  
        await user.save();
  
        // Log para verificar si se guardó correctamente
        console.log('Curso añadido correctamente al carrito');
        return { message: 'Curso añadido al carrito' };
      } else {
        throw new Error('El curso no existe');
      }
    } catch (error) {
      console.error('Error al añadir curso al carrito:', error.message);
      throw new Error('No se pudo añadir el curso al carrito');
    }
  }

  // Función para vaciar el carrito
  async clearCart(userId: string) {
    const user = await this.userModel.findById(userId);
    user.cart = [];
    await user.save();
    return { message: 'Carrito limpiado' };
  }


  // Procesar la compra de cursos desde el carrito
  async purchaseCourses(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Obtener el carrito del usuario usando RabbitMQ
    const cart = await this.rabbitMQClientService.sendToQueue('get_cart', userId); // Recibimos el carrito de RabbitMQ
    if (!cart || cart.courses.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
  
    // Agregar los cursos al historial de compras
    user.purchasedCourses = [...user.purchasedCourses, ...cart.courses.map(c => c.courseId)];
    await user.save();
  
    // Vaciar el carrito usando RabbitMQ
    await this.rabbitMQClientService.emitToQueue('clear_cart', userId);
  
    return user;
  }
}
