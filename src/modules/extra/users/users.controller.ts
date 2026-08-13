import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { Users } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<Users> {
    return this.usersService.loginUser(dto);
  }
}