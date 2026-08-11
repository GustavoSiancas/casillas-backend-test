import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer, ConsumerType } from './consumer.entity';
import { UserRole, Users } from 'src/user/users.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from 'src/user/users.service';
import { CreateIndividualDto } from './dtos/request/create-individual.dto';
import { UserResponse } from './dtos/response/user.response';
import { Individual } from './types/individual/individual.entity';
import { CreateBusinessDto } from './dtos/request/create-business.dto';
import { Business } from './types/business/business.entity';
import { CreateLawFirmDto } from './dtos/request/create-law-firm.dto';
import { LawFirm } from './types/law_firm/law-firm.entity';

@Injectable()
export class ConsumerService {
    constructor(
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
    
        private readonly dataSource: DataSource,

        private readonly usersService: UsersService
    ) {}

    async createIndividualConsumer(
        dto: CreateIndividualDto,
    ): Promise<UserResponse> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.registerUser(
                {
                    email: dto.email,
                    password: dto.dni,
                    role: UserRole.CONSUMER,
                },
                manager,
            );

            const consumer = manager.create(Consumer, {
                consumerType: ConsumerType.INDIVIDUAL,
                email: dto.email,
                phone: dto.phone,
                principal_phone: dto.principal_phone,
                legal_representative: dto.legal_representative ?? null,
                legal_adress: dto.legal_adress,
                user,
            });

            await manager.save(Consumer, consumer);

            const individual = manager.create(Individual, {
                full_name: dto.full_name,
                cal_number: dto.cal_number,
                dni: dto.dni,
                consumer,
            });

            await manager.save(Individual, individual);

            return {
                email: user.email,
                password: dto.dni,
            };
        });
    }

    async createBusinessConsumer(
        dto: CreateBusinessDto,
    ): Promise<UserResponse> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.registerUser(
                {
                    email: dto.email,
                    password: dto.ruc,
                    role: UserRole.CONSUMER,
                },
                manager,
            );

            const consumer = manager.create(Consumer, {
                consumerType: ConsumerType.BUSINESS,
                email: dto.email,
                phone: dto.phone,
                principal_phone: dto.principal_phone,
                legal_representative: dto.legal_representative,
                legal_adress: dto.legal_adress,
                user,
            });

            await manager.save(Consumer, consumer);

            const business = manager.create(Business, {
                ruc: dto.ruc,
                social_reason: dto.social_reason,
                consumer,
            });

            await manager.save(Business, business);

            return {
                email: user.email,
                password: dto.ruc,
            };
        });
    }

    async createLawFirmConsumer(
        dto: CreateLawFirmDto,
    ): Promise<UserResponse> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.registerUser(
                {
                    email: dto.email,
                    password: dto.ruc,
                    role: UserRole.CONSUMER,
                },
                manager,
            );

            const consumer = manager.create(Consumer, {
                consumerType: ConsumerType.LAW_FIRM,
                email: dto.email,
                phone: dto.phone,
                principal_phone: dto.principal_phone,
                legal_representative: dto.legal_representative,
                legal_adress: dto.legal_adress,
                user,
            });

            await manager.save(Consumer, consumer);

            const lawFirm = manager.create(LawFirm, {
                ruc: dto.ruc,
                firm_name: dto.firm_name,
                consumer,
            });

            await manager.save(LawFirm, lawFirm);

            return {
                email: user.email,
                password: dto.ruc,
            };
        });
    }

    async getAllConsumers(): Promise<Consumer[]> {
        return await this.consumerRepository.find();
    }
}