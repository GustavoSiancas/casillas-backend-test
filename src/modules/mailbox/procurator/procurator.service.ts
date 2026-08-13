import { Injectable } from '@nestjs/common';
import { Procurator } from './procurator.entity';
import { DataSource } from 'typeorm';
import { CreateProcuratorDto } from 'src/modules/mailbox/consumer/dtos/request/create-procurator.dto';

@Injectable()
export class ProcuratorService {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async createProcurator(
        dto: CreateProcuratorDto,
    ): Promise<Procurator> {
        return this.dataSource.transaction(async (manager) => {
            const procurator = manager.create(Procurator, {
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


}
