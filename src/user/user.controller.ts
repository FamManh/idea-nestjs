import { Controller, Post, Get, Body, UsePipes, ValidationPipe } from '@nestjs/common';

import { UserService } from './user.service';
import { UserDTO } from './user.dto';

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @Get('api/users')
    showAllUsers() {
        return this.userService.showAll();
    }

    @Post('/api/login')
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDTO) {
        return this.userService.login(data);
    }

    @Post('/api/register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDTO) {
        return this.userService.register(data);
    }
}
