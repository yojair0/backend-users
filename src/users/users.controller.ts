import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    const userId = req.user.userId; // El ID del usuario viene del token JWT
    return await this.usersService.updateUser(userId, updateUserDto);
  }

  @Get('purchase-history')
  @UseGuards(JwtAuthGuard)
  async getPurchaseHistory(@Request() req) {
    const userId = req.user.userId; // Extraer el ID del token JWT
    return await this.usersService.getPurchaseHistory(userId);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async addToCart(@Request() req, @Body('courseId') courseId: string) {
    const userId = req.user.userId; // Extraer el userId del token JWT
    return this.usersService.addToCart(userId, courseId);
  }

  @Patch('cart/clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Request() req) {
    const userId = req.user.userId; // Extraer el userId del token JWT
    return this.usersService.clearCart(userId);
  }
}
