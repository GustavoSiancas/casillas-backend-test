import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer } from './consumer.entity';
import { UserRole, Users } from 'src/user/users.entity';
import { Repository } from 'typeorm';
import { CreateConsumerDto } from './dtos/create-consumer.dto';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class ConsumerService {
    constructor(
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
        
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
    ) {}

    async createConsumer(dto: CreateConsumerDto): Promise<Consumer> {
        const user = await this.usersRepository.findOne({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${dto.userId} not found`);
        }

        if (user.role === UserRole.CONSUMER){
            const consumer = this.consumerRepository.create({
                names: dto.names,
                consumerType: dto.consumerType,
                user: user,
                });
            return await this.consumerRepository.save(consumer);
        
        } else {
            throw new NotFoundException(`User with ID ${dto.userId} is not a consumer`);
        }
    
    }
}