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
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('Cart') private cartModel: Model<CartItem>, // Asegúrate de que el nombre coincide con el registrado
    private jwtService: JwtService,
    private rabbitMQClientService: RabbitMQClientService,
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

  // Función para agregar al carrito, almacenando el curso como string JSON
  async addToCart(userId: string, courseId: string, courseDetails: { title: string; price: number }) {
    // Convertir los detalles del curso en un string JSON
    const courseDetailsJson = JSON.stringify(courseDetails);

    // Buscar al usuario
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el curso ya está en el carrito
    const existingCartItemIndex = user.cart.findIndex((item) => JSON.parse(item).courseId === courseId);

    if (existingCartItemIndex !== -1) {
        // Si ya existe, aumentar la cantidad
        const existingCartItem = JSON.parse(user.cart[existingCartItemIndex]);
        existingCartItem.quantity += 1;
        user.cart[existingCartItemIndex] = JSON.stringify(existingCartItem);
    } else {
        // Si no existe, agregar el curso como string JSON en el carrito
        user.cart.push(courseDetailsJson);
    }

    await user.save();
    return { message: 'Curso añadido al carrito' };
  }




  // Obtener el carrito de un usuario, deserializando cada curso
  async getUserCart(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Deserializar cada curso del carrito antes de retornarlo
    return user.cart.map((item) => JSON.parse(item));
  }


  // Limpiar el carrito de un usuario
  async clearUserCart(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.cart = []; // Vaciar el carrito
    await user.save();
    return { message: 'Carrito limpiado' };
  }


  // Función para obtener los detalles del curso desde RabbitMQ como string JSON
  async getCourseDetails(courseId: string): Promise<string> {
    const courseDetails = await this.rabbitMQClientService.sendToQueue('get_course_details', { courseId });

    if (!courseDetails) {
      throw new NotFoundException('El curso no existe');
    }

    // Serializar los detalles del curso como string JSON antes de retornarlo
    return JSON.stringify({
      courseId: courseId,
      title: courseDetails.title,
      price: courseDetails.price,
    });
  }
  
    
}
