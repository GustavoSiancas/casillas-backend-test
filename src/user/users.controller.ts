import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { LoginRequestDto } from './dtos/login-request.dto';
import { Users } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<Users> {
    return this.usersService.registerUser(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<Users> {
    return this.usersService.loginUser(dto);
  }
}