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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const rabbitmq_client_service_1 = require("../rabbitmq-client.service");
let UsersController = class UsersController {
    constructor(usersService, rabbitMQClientService) {
        this.usersService = usersService;
        this.rabbitMQClientService = rabbitMQClientService;
    }
    async register(createUserDto) {
        return await this.usersService.register(createUserDto);
    }
    async login(email, password) {
        return await this.usersService.login(email, password);
    }
    async update(req, updateUserDto) {
        const userId = req.user.userId;
        return await this.usersService.updateUser(userId, updateUserDto);
    }
    async getPurchaseHistory(req) {
        const userId = req.user.userId;
        return await this.usersService.getPurchaseHistory(userId);
    }
    async addToCart(req, courseId) {
        const userId = req.user.userId;
        try {
            const courseDetails = await this.rabbitMQClientService.sendToQueue('get_course_details', { courseId });
            if (!courseDetails) {
                throw new Error('Course details not found');
            }
            return await this.usersService.addToCart(userId, courseId, courseDetails);
        }
        catch (error) {
            console.error('Error al añadir el curso al carrito:', error);
            throw new Error('No se pudo obtener los detalles del curso o añadirlo al carrito');
        }
    }
    async getCart(req) {
        const userId = req.user.userId;
        return await this.usersService.getUserCart(userId);
    }
    async clearCart(req) {
        const userId = req.user.userId;
        return await this.usersService.clearUserCart(userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "login", null);
__decorate([
    (0, common_1.Patch)('update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('purchase-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPurchaseHistory", null);
__decorate([
    (0, common_1.Post)('cart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Get)('cart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCart", null);
__decorate([
    (0, common_1.Patch)('cart/clear'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "clearCart", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        rabbitmq_client_service_1.RabbitMQClientService])
], UsersController);
//# sourceMappingURL=users.controller.js.map