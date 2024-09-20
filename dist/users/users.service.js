"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const rabbitmq_client_service_1 = require("../rabbitmq-client.service");
let UsersService = class UsersService {
    constructor(userModel, jwtService, rabbitMQClientService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.rabbitMQClientService = rabbitMQClientService;
    }
    async register(createUserDto) {
        const { email, password } = createUserDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.userModel({ ...createUserDto, password: hashedPassword });
        const savedUser = await user.save();
        await this.rabbitMQClientService.emitToQueue('user_created', savedUser);
        return savedUser;
    }
    async login(email, password) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.NotFoundException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.NotFoundException('Invalid email or password');
        }
        const payload = { sub: user._id, email: user.email };
        const token = this.jwtService.sign(payload);
        return { token };
    }
    async getUserById(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUser(userId, updateUserDto) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async getPurchaseHistory(userId) {
        const user = await this.userModel.findById(userId).select('purchasedCourses');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.purchasedCourses;
    }
    async getAllUsers() {
        return await this.userModel.find().exec();
    }
    async addToCart(userId, courseId) {
        console.log(`Añadiendo curso ${courseId} al carrito del usuario ${userId}`);
        try {
            const courseDetails = await this.rabbitMQClientService.sendToQueue('get_course_details', { courseId });
            console.log(`Detalles del curso:`, courseDetails);
            if (courseDetails) {
                const user = await this.userModel.findById(userId);
                if (!user) {
                    throw new common_1.NotFoundException('User not found');
                }
                user.cart.push({
                    courseId: courseDetails.courseId,
                    title: courseDetails.title,
                    price: courseDetails.price,
                });
                await user.save();
                console.log('Curso añadido correctamente al carrito');
                return { message: 'Curso añadido al carrito' };
            }
            else {
                throw new Error('El curso no existe');
            }
        }
        catch (error) {
            console.error('Error al añadir curso al carrito:', error.message);
            throw new Error('No se pudo añadir el curso al carrito');
        }
    }
    async clearCart(userId) {
        const user = await this.userModel.findById(userId);
        user.cart = [];
        await user.save();
        return { message: 'Carrito limpiado' };
    }
    async purchaseCourses(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const cart = await this.rabbitMQClientService.sendToQueue('get_cart', userId);
        if (!cart || cart.courses.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        user.purchasedCourses = [...user.purchasedCourses, ...cart.courses.map(c => c.courseId)];
        await user.save();
        await this.rabbitMQClientService.emitToQueue('clear_cart', userId);
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        rabbitmq_client_service_1.RabbitMQClientService])
], UsersService);
//# sourceMappingURL=users.service.js.map