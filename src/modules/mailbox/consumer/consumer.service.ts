import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer } from './entities/consumer.entity';
import { Users } from 'src/modules/extra/users/users.entity';
import { UserRole } from 'src/modules/extra/users/enum/users-role.enum';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { UsersService } from 'src/modules/extra/users/users.service';
import { CreateIndividualDto } from './dto/request/create-individual.dto';
import { UserResponse } from '../../extra/users/dto/user.response';
import { Individual } from './entities/individual.entity';
import { CreateBusinessDto } from './dto/request/create-business.dto';
import { Business } from './entities/business.entity';
import { CreateLawFirmDto } from './dto/request/create-law-firm.dto';
import { LawFirm } from './entities/law-firm.entity';
import { ConsumerType } from './enum/consumer-type.enum';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { PaginationMetaResponse } from 'src/common/dtos/pages/pagination.meta.response';

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
                numberID: dto.dni,
                name: dto.full_name,
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
                numberID: dto.ruc,
                name: dto.social_reason,
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
                numberID: dto.ruc,
                name: dto.firm_name,
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

    async getAllConsumers(
        page: number,
        limit: number,
        numberID?: string,
        name?: string,
        consumerType?: ConsumerType,
    ): Promise<PaginatedResponse<Consumer>> {
        const where: FindOptionsWhere<Consumer> = {};

        if (numberID !== undefined) where.numberID = numberID;
        if (name !== undefined) where.name = Like(`%${name}%`);
        if (consumerType !== undefined) where.consumerType = consumerType;

        const [consumers, total] = await this.consumerRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: {
                updatedAt: 'DESC',
                id: 'DESC',
            },
        });

        return new PaginatedResponse(
            consumers,
            new PaginationMetaResponse(page, limit, total),
        );
    }

    async getConsumerById(id: number): Promise<Consumer> {
        const consumer = await this.consumerRepository.findOne({
            where: { id },
            relations: {
                individual: true,
                business: true,
                lawFirm: true,
            },
        });

        if (!consumer) {
            throw new NotFoundException('Consumidor no encontrado');
        }

        return consumer;
    }

    async getConsumerWithDataUnique(
        data: string,
        consumerType: ConsumerType,
    ): Promise<Consumer | null> {
        switch (consumerType) {
            case ConsumerType.INDIVIDUAL:
                return this.consumerRepository.findOne({
                    where: {
                        consumerType,
                        numberID: data,
                    },
                    relations: { individual: true },
                });

            case ConsumerType.BUSINESS:
                return this.consumerRepository.findOne({
                    where: {
                        consumerType,
                        numberID: data,
                    },
                    relations: { business: true },
                });

            case ConsumerType.LAW_FIRM:
                return this.consumerRepository.findOne({
                    where: {
                        consumerType,
                        numberID: data,
                    },
                    relations: { lawFirm: true },
                });

            default:
                return null;
        }
    }
}
