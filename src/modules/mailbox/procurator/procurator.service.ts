import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Procurator } from './procurator.entity';
import { DataSource } from 'typeorm';
import { CreateProcuratorDto } from 'src/modules/mailbox/consumer/dto/request/create-procurator.dto';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';

@Injectable()
export class ProcuratorService {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async addProcuratorToConsumer(
        consumerId: number,
        dto: CreateProcuratorDto,
    ): Promise<Procurator> {
        return this.dataSource.transaction(async (manager) => {
            const consumer = await manager.findOneBy(Consumer, {
                id: consumerId,
            });
            if (!consumer) {
                throw new NotFoundException('Consumidor no encontrado');
            }

            const existingProcurator = await manager.findOne(Procurator, {
                where: {
                    consumer: { id: consumerId },
                    document_type: dto.document_type,
                    document_number: dto.document_number,
                },
                withDeleted: true,
            });
            if (existingProcurator) {
                throw new ConflictException(
                    'El procurador ya está registrado para este consumidor',
                );
            }

            const procurator = manager.create(Procurator, {
                consumer,
                names: dto.names,
                last_names: dto.last_names,
                document_type: dto.document_type,
                document_number: dto.document_number,
                phone: dto.phone,
                email: dto.email,
            });
            return manager.save(procurator);
        });
    }

    async getProcuratorsByConsumer(
        consumerId: number,
    ): Promise<Procurator[]> {
        const consumerExists = await this.dataSource.manager.existsBy(
            Consumer,
            { id: consumerId },
        );
        if (!consumerExists) {
            throw new NotFoundException('Consumidor no encontrado');
        }

        return this.dataSource.manager.find(Procurator, {
            where: { consumer: { id: consumerId } },
            order: {
                updated_at: 'DESC',
                id: 'DESC',
            },
        });
    }
}
