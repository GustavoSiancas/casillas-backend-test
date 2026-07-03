import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer } from './consumer.entity';
import { UserRole, Users } from 'src/user/users.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateConsumerDto } from './dtos/create-consumer.dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class ConsumerService {
    constructor(
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
    
        private readonly dataSource: DataSource,

        private readonly usersService: UsersService
    ) {}

    // just a method to create a consumer, this method is aviable for collaborators
    async createConsumer(dto: CreateConsumerDto): Promise<Consumer> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.registerUser(
                {
                    email: dto.email,
                    password: dto.password,
                    role: UserRole.CONSUMER,
                },
                manager,
            );

            const consumer = manager.create(Consumer, {
                names: dto.names,
                consumerType: dto.consumerType,
                dni: dto.dni,
                user,
            });

            return await manager.save(consumer);
        });
    }

    async getAllConsumers(): Promise<Consumer[]> {
        return await this.consumerRepository.find();
    }
}