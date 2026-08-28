import { DataSource, Repository } from 'typeorm';
import { MailboxConsumerStatus } from 'src/modules/mailbox/assignments/enum/mailbox-consumer-status.enum';
import { MailboxConsumerStatusReason } from 'src/modules/mailbox/assignments/enum/mailbox-consumer-status-reason.enum';
import { MailboxConsumer } from 'src/modules/mailbox/assignments/entities/mailbox-consumer.entity';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import {
    MailboxItem,
    MailboxItemAccessStatus,
    MailboxItemStatus,
} from './entites/mailbox-item.entity';
import { MailboxItemService } from './item.service';

describe('MailboxItemService', () => {
    const dto = { title: 'Carta', description: 'Documento recibido' };

    function createService(assignment: MailboxConsumer | null) {
        const mailbox = { id: 4 } as Mailbox;
        const manager = {
            findOne: jest
                .fn()
                .mockResolvedValueOnce(mailbox)
                .mockResolvedValueOnce(assignment),
            create: jest.fn((_entity, data) => data),
            save: jest.fn(async (data) => data),
        };
        const dataSource = {
            transaction: jest.fn((callback) => callback(manager)),
        } as unknown as DataSource;
        const service = new MailboxItemService(
            {} as Repository<MailboxItem>,
            dataSource,
        );
        return { service, manager, mailbox };
    }

    it('creates a visible received item for an active paid assignment', async () => {
        const assignment = {
            id: 8,
            status: MailboxConsumerStatus.ACTIVE,
            statusReason: MailboxConsumerStatusReason.PAID,
        } as MailboxConsumer;
        const { service, manager, mailbox } = createService(assignment);

        await service.createMailboxItem(4, dto);

        expect(manager.create).toHaveBeenCalledWith(
            MailboxItem,
            expect.objectContaining({
                mailbox,
                mailboxConsumer: assignment,
                status: MailboxItemStatus.RECEIVED,
                accessStatus: MailboxItemAccessStatus.VISIBLE,
            }),
        );
    });

    it('blocks an item received for an unpaid assignment', async () => {
        const assignment = {
            id: 8,
            status: MailboxConsumerStatus.ACTIVE,
            statusReason: MailboxConsumerStatusReason.UNPAID,
        } as MailboxConsumer;
        const { service, manager } = createService(assignment);

        await service.createMailboxItem(4, dto);

        expect(manager.create).toHaveBeenCalledWith(
            MailboxItem,
            expect.objectContaining({
                accessStatus: MailboxItemAccessStatus.BLOCKED_UNPAID,
            }),
        );
    });

    it('stores an unassigned item when the mailbox has no active assignment', async () => {
        const { service, manager } = createService(null);

        await service.createMailboxItem(4, dto);

        expect(manager.create).toHaveBeenCalledWith(
            MailboxItem,
            expect.objectContaining({
                mailboxConsumer: null,
                accessStatus: MailboxItemAccessStatus.UNASSIGNED,
            }),
        );
    });

    it('paginates items from all active assignments of a consumer', async () => {
        const item = {
            id: 20,
            mailbox: { id: 4 },
            mailboxConsumer: { id: 8, consumer: { id: 2 } },
        } as MailboxItem;
        const queryBuilder = {
            innerJoinAndSelect: jest.fn(),
            innerJoin: jest.fn(),
            leftJoinAndSelect: jest.fn(),
            where: jest.fn(),
            andWhere: jest.fn(),
            orderBy: jest.fn(),
            skip: jest.fn(),
            take: jest.fn(),
            getManyAndCount: jest.fn().mockResolvedValue([[item], 11]),
        };
        for (const method of [
            'innerJoinAndSelect',
            'innerJoin',
            'leftJoinAndSelect',
            'where',
            'andWhere',
            'orderBy',
            'skip',
            'take',
        ] as const) {
            queryBuilder[method].mockReturnValue(queryBuilder);
        }
        const repository = {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        } as unknown as Repository<MailboxItem>;
        const service = new MailboxItemService(
            repository,
            {} as DataSource,
        );

        await expect(
            service.getActiveMailboxItemsForConsumer(2, 2, 5, [
                MailboxItemAccessStatus.VISIBLE,
                MailboxItemAccessStatus.BLOCKED_UNPAID,
            ]),
        ).resolves.toEqual({
            data: [item],
            pagination: {
                page: 2,
                limit: 5,
                total: 11,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
            },
        });
        expect(queryBuilder.where).toHaveBeenCalledWith(
            'consumer.id = :consumerId',
            { consumerId: 2 },
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'activeMailboxConsumer.status = :assignmentStatus',
            { assignmentStatus: MailboxConsumerStatus.ACTIVE },
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'item.accessStatus IN (:...accessStatuses)',
            {
                accessStatuses: [
                    MailboxItemAccessStatus.VISIBLE,
                    MailboxItemAccessStatus.BLOCKED_UNPAID,
                ],
            },
        );
        expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
            'mailbox.mailboxConsumers',
            'activeMailboxConsumer',
            'activeMailboxConsumer.status = :assignmentStatus',
            { assignmentStatus: MailboxConsumerStatus.ACTIVE },
        );
        expect(queryBuilder.skip).toHaveBeenCalledWith(5);
        expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('filters consumer items by assignment, status and received dates', async () => {
        const queryBuilder = {
            innerJoinAndSelect: jest.fn(),
            innerJoin: jest.fn(),
            leftJoinAndSelect: jest.fn(),
            where: jest.fn(),
            andWhere: jest.fn(),
            orderBy: jest.fn(),
            skip: jest.fn(),
            take: jest.fn(),
            getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        };
        for (const method of [
            'innerJoinAndSelect',
            'innerJoin',
            'leftJoinAndSelect',
            'where',
            'andWhere',
            'orderBy',
            'skip',
            'take',
        ] as const) {
            queryBuilder[method].mockReturnValue(queryBuilder);
        }
        const service = new MailboxItemService(
            {
                createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
            } as unknown as Repository<MailboxItem>,
            {} as DataSource,
        );

        await service.getActiveMailboxItemsForConsumer(
            2,
            1,
            10,
            [MailboxItemAccessStatus.VISIBLE],
            8,
            MailboxItemStatus.RECEIVED,
            '2026-08-01',
            '2026-08-28',
        );

        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'activeMailboxConsumer.id = :mailboxConsumerId',
            { mailboxConsumerId: 8 },
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'item.status = :status',
            { status: MailboxItemStatus.RECEIVED },
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'item.receivedAt >= :fromDate',
            { fromDate: new Date('2026-08-01') },
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'item.receivedAt <= :toDate',
            { toDate: new Date('2026-08-28T23:59:59.999Z') },
        );
    });
});
