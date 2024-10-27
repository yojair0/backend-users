import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RabbitMQClientService } from '../rabbitmq-client.service'; // Importa RabbitMQClientService

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rabbitMQClientService: RabbitMQClientService // Inyecta RabbitMQClientService
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.register(createUserDto);
  }


  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return await this.usersService.login(email, password);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.userId;
    return await this.usersService.updateUser(userId, updateUserDto);
  }

  @Get('purchase-history')
  @UseGuards(JwtAuthGuard)
  async getPurchaseHistory(@Request() req) {
    const userId = req.user.userId;
    return await this.usersService.getPurchaseHistory(userId);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async addToCart(@Request() req, @Body('courseId') courseId: string) {
    const userId = req.user.userId;
  
    try {
      // Obtener los detalles del curso desde RabbitMQ
      const courseDetails = await this.rabbitMQClientService.sendToQueue('get_course_details', { courseId });
      
      if (!courseDetails) {
        throw new Error('Course details not found');
      }
  
      // Añadir el curso al carrito usando los detalles obtenidos
      return await this.usersService.addToCart(userId, courseId, courseDetails);
    } catch (error) {
      console.error('Error al añadir el curso al carrito:', error);
      throw new Error('No se pudo obtener los detalles del curso o añadirlo al carrito');
    }
  }
  
  @Get('cart')
  @UseGuards(JwtAuthGuard)
  async getCart(@Request() req) {
    const userId = req.user.userId;
    return await this.usersService.getUserCart(userId);
  }

  @Patch('cart/clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Request() req) {
    const userId = req.user.userId;
    return await this.usersService.clearUserCart(userId);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchaseCart(@Request() req) {
    const userId = req.user.userId;
    return await this.usersService.purchaseCartItems(userId);
  }

}
