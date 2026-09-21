import { Repository } from 'typeorm';
import { ConsumerType } from 'src/modules/mailbox/consumer/enum/consumer-type.enum';
import { UserRole } from './enum/users-role.enum';
import { Users } from './users.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
    compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
    it('includes the consumer type when a consumer logs in', async () => {
        const user = {
            id: 1,
            email: 'consumer@example.com',
            password: 'hashed-password',
            role: UserRole.CONSUMER,
            consumer: {
                id: 8,
                consumerType: ConsumerType.LAW_FIRM,
                numberID: '20123456789',
                name: 'Estudio Legal',
            },
        } as Users;
        const repository = {
            findOne: jest.fn().mockResolvedValue(user),
        } as unknown as jest.Mocked<Repository<Users>>;
        const service = new UsersService(repository);

        const result = await service.loginUser({
            email: user.email,
            password: 'password',
        });
        expect(result).toMatchObject({
            id: 1,
            email: user.email,
            password: user.password,
            role: UserRole.CONSUMER,
            consumerType: ConsumerType.LAW_FIRM,
            consumerId: 8,
            consumer: {
                id: 8,
                ruc: '20123456789',
                firm_name: 'Estudio Legal',
            },
        });
        expect(repository.findOne).toHaveBeenCalledWith({
            where: { email: user.email },
            relations: {
                consumer: {
                    individual: true,
                    business: true,
                    lawFirm: true,
                },
            },
        });
    });
});
