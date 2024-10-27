import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RabbitMQClientService } from '../rabbitmq-client.service';
export declare class UsersController {
    private readonly usersService;
    private readonly rabbitMQClientService;
    constructor(usersService: UsersService, rabbitMQClientService: RabbitMQClientService);
    register(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").User>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
    update(req: any, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").User>;
    getPurchaseHistory(req: any): Promise<import("./schemas/user.schema").PurchasedCourse[]>;
    addToCart(req: any, courseId: string): Promise<{
        message: string;
    }>;
    getCart(req: any): Promise<any[]>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
    purchaseCart(req: any): Promise<any>;
}
