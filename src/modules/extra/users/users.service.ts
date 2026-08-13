import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import * as bcrypt from 'bcrypt';
import { EntityManager, Repository } from "typeorm";
import { RegisterRequestDto } from "./dtos/register-request.dto";
import { LoginRequestDto } from "./dtos/login-request.dto";
import { UnauthorizedException } from "@nestjs/common/exceptions";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
    ) {}

    async registerUser(
        dto: RegisterRequestDto,
        manager?: EntityManager,
    ): Promise<Users> {
        const repository = manager
            ? manager.getRepository(Users)
            : this.usersRepository;

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = repository.create(dto);
        user.password = hashedPassword;

        return await repository.save(user);
    }

    async loginUser(dto: LoginRequestDto): Promise<Users> {
        const user = await this.usersRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }



}