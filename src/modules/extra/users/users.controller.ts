import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponse } from './dto/login-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<LoginResponse> {
    return this.usersService.loginUser(dto);
  }
}
