import { DataSource, Repository } from 'typeorm';
import { UsersService } from 'src/modules/extra/users/users.service';
import { ConsumerService } from './consumer.service';
import { Consumer } from './entities/consumer.entity';
import { ConsumerType } from './enum/consumer-type.enum';
import { ConsumerBaseResponse } from './dto/response/consumer-base.response';

describe('ConsumerService', () => {
    it('maps a consumer response when fromEntity is used as a callback', () => {
        const consumer = {
            id: 7,
            consumerType: ConsumerType.INDIVIDUAL,
            numberID: '12345678',
            name: 'Ana Pérez',
        } as Consumer;

        expect([consumer].map(ConsumerBaseResponse.fromEntity)[0]).toEqual(
            expect.objectContaining({
                id: 7,
                numberID: '12345678',
                name: 'Ana Pérez',
            }),
        );
    });

    it('lists consumers with pagination and common filters', async () => {
        const consumer = { id: 7 } as Consumer;
        const repository = {
            findAndCount: jest.fn().mockResolvedValue([[consumer], 12]),
        } as unknown as jest.Mocked<Repository<Consumer>>;
        const service = new ConsumerService(
            repository,
            {} as DataSource,
            {} as UsersService,
        );

        const result = await service.getAllConsumers(
            2,
            5,
            '20123456789',
            'Estudio',
            ConsumerType.LAW_FIRM,
        );

        expect(result).toEqual({
            data: [consumer],
            pagination: {
                page: 2,
                limit: 5,
                total: 12,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
            },
        });
        expect(repository.findAndCount).toHaveBeenCalledWith({
            where: {
                numberID: '20123456789',
                name: expect.anything(),
                consumerType: ConsumerType.LAW_FIRM,
            },
            skip: 5,
            take: 5,
            order: {
                updatedAt: 'DESC',
                id: 'DESC',
            },
        });
    });
});
