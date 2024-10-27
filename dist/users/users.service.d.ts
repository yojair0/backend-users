import { Model } from 'mongoose';
import { User, UserDocument, PurchasedCourse } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RabbitMQClientService } from '../rabbitmq-client.service';
export declare class UsersService {
    private userModel;
    private jwtService;
    private rabbitMQClientService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, rabbitMQClientService: RabbitMQClientService);
    register(createUserDto: CreateUserDto): Promise<User>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
    getUserById(userId: string): Promise<User>;
    updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
    getPurchaseHistory(userId: string): Promise<PurchasedCourse[]>;
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
    purchaseCartItems(userId: string): Promise<any>;
}
