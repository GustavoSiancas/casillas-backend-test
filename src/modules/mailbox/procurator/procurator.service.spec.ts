import { DataSource } from 'typeorm';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { ProcuratorDocumentType } from './procurator.entity';
import { ProcuratorService } from './procurator.service';

describe('ProcuratorService', () => {
    it('creates a procurator owned by the requested consumer', async () => {
        const consumer = { id: 2 } as Consumer;
        const created = { id: 9, consumer };
        const manager = {
            findOneBy: jest.fn().mockResolvedValue(consumer),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(created),
            save: jest.fn().mockResolvedValue(created),
        };
        const dataSource = {
            transaction: jest.fn((callback) => callback(manager)),
        } as unknown as DataSource;
        const service = new ProcuratorService(dataSource);
        const dto = {
            names: 'Ana',
            last_names: 'Pérez',
            document_type: ProcuratorDocumentType.DNI,
            document_number: '12345678',
            phone: '999999999',
            email: 'ana@example.com',
        };

        await expect(
            service.addProcuratorToConsumer(2, dto),
        ).resolves.toBe(created);
        expect(manager.create).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({ consumer }),
        );
    });
});
