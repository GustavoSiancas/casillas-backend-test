import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Procurator } from './procurator.entity';
import { DataSource, Repository } from 'typeorm';
import { Consumer } from 'src/consumer/consumer.entity';
import { CreateProcuratorDto } from 'src/consumer/dtos/request/create-procurator.dto';

@Injectable()
export class ProcuratorService {
    constructor(
        @InjectRepository(Procurator)
        private readonly procuratorRepository: Repository<Procurator>,
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
        
        private readonly dataSource: DataSource
    ) {}

    async createProcurator(
        dto: CreateProcuratorDto,
    ): Promise<Procurator> {
        return this.dataSource.transaction(async (manager) => {
            const consumer = await this.consumerRepository.findOne({
                where: { id: dto.consumerId },
            });
            if (!consumer) {
                throw new Error('Consumer not found');
            }
            const procurator = this.procuratorRepository.create({
                names: dto.names,
                last_names: dto.last_names,
                document_type: dto.document_type,
                document_number: dto.document_number,
                phone: dto.phone,
                email: dto.email,
                consumer: consumer,
            });
            return await manager.save(procurator);
        });
    }


}