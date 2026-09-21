import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import * as bcrypt from 'bcrypt';
import { EntityManager, Repository } from "typeorm";
import { RegisterRequestDto } from "./dto/register-request.dto";
import { LoginRequestDto } from "./dto/login-request.dto";
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { UserRole } from './enum/users-role.enum';
import { LoginResponse } from './dto/login-response.dto';
import { consumerResponseByType } from 'src/modules/mailbox/consumer/dto/response/consumer-detail.response';

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

    async loginUser(dto: LoginRequestDto): Promise<LoginResponse> {
        const user = await this.usersRepository.findOne({
            where: { email: dto.email },
            relations: {
                consumer: {
                    individual: true,
                    business: true,
                    lawFirm: true,
                },
            },
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

        const { consumer, ...userData } = user;
        const isConsumer = user.role === UserRole.CONSUMER;

        return {
            ...userData,
            consumerType:
                isConsumer ? consumer?.consumerType ?? null : null,
            consumerId: isConsumer ? consumer?.id ?? null : null,
            consumer:
                isConsumer && consumer
                    ? consumerResponseByType[consumer.consumerType].fromEntity(
                          consumer,
                      )
                    : null,
        };
    }



}
