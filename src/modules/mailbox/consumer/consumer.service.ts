import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer } from './entities/consumer.entity';
import { Users } from 'src/modules/extra/users/users.entity';
import { UserRole } from 'src/modules/extra/users/enum/users-role.enum';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from 'src/modules/extra/users/users.service';
import { CreateIndividualDto } from './dto/request/create-individual.dto';
import { UserResponse } from '../../extra/users/dto/user.response';
import { Individual } from './entities/individual.entity';
import { CreateBusinessDto } from './dto/request/create-business.dto';
import { Business } from './entities/business.entity';
import { CreateLawFirmDto } from './dto/request/create-law-firm.dto';
import { LawFirm } from './entities/law-firm.entity';
import { ConsumerType } from './enum/consumer-type.enum';

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
        return this.consumerRepository.find();
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
                        individual: { dni: data },
                    },
                    relations: { individual: true },
                });

            case ConsumerType.BUSINESS:
                return this.consumerRepository.findOne({
                    where: {
                        consumerType,
                        business: { ruc: data },
                    },
                    relations: { business: true },
                });

            case ConsumerType.LAW_FIRM:
                return this.consumerRepository.findOne({
                    where: {
                        consumerType,
                        lawFirm: { ruc: data },
                    },
                    relations: { lawFirm: true },
                });

            default:
                return null;
        }
    }
}
