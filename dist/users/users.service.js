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
    async addToCart(userId, courseId, courseDetails) {
        const courseDetailsJson = JSON.stringify(courseDetails);
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const existingCartItemIndex = user.cart.findIndex((item) => JSON.parse(item).courseId === courseId);
        if (existingCartItemIndex !== -1) {
            const existingCartItem = JSON.parse(user.cart[existingCartItemIndex]);
            existingCartItem.quantity += 1;
            user.cart[existingCartItemIndex] = JSON.stringify(existingCartItem);
        }
        else {
            user.cart.push(courseDetailsJson);
        }
        await user.save();
        return { message: 'Curso añadido al carrito' };
    }
    async getUserCart(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return user.cart.map((item) => JSON.parse(item));
    }
    async clearUserCart(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        user.cart = [];
        await user.save();
        return { message: 'Carrito limpiado' };
    }
    async getCourseDetails(courseId) {
        const courseDetails = await this.rabbitMQClientService.sendToQueue('get_course_details', { courseId });
        if (!courseDetails) {
            throw new common_1.NotFoundException('El curso no existe');
        }
        return JSON.stringify({
            courseId: courseId,
            title: courseDetails.title,
            price: courseDetails.price,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        rabbitmq_client_service_1.RabbitMQClientService])
], UsersService);
//# sourceMappingURL=users.service.js.map