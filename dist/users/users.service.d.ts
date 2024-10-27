import { Model } from 'mongoose';
import { User, UserDocument, CartItem } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RabbitMQClientService } from '../rabbitmq-client.service';
export declare class UsersService {
    private userModel;
    private cartModel;
    private jwtService;
    private rabbitMQClientService;
    constructor(userModel: Model<UserDocument>, cartModel: Model<CartItem>, jwtService: JwtService, rabbitMQClientService: RabbitMQClientService);
    register(createUserDto: CreateUserDto): Promise<User>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
    getUserById(userId: string): Promise<User>;
    updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
    getPurchaseHistory(userId: string): Promise<string[]>;
    getAllUsers(): Promise<User[]>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    purchaseCourses(userId: string): Promise<User>;
    addToCart(userId: string, courseId: string, courseDetails: {
        title: string;
        price: number;
    }): Promise<{
        message: string;
    }>;
    getUserCart(userId: string): Promise<any[]>;
    clearUserCart(userId: string): Promise<{
        message: string;
    }>;
    getCourseDetails(courseId: string): Promise<string>;
}
