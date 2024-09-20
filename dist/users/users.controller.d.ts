import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").User>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
    update(req: any, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").User>;
    getPurchaseHistory(req: any): Promise<string[]>;
    addToCart(req: any, courseId: string): Promise<{
        message: string;
    }>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
}
