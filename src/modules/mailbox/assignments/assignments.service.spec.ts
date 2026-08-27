import { ConflictException } from '@nestjs/common';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { DataSource } from 'typeorm';
import { MailboxConsumer } from './entities/mailbox-consumer.entity';
import { MailboxConsumerStatus } from './enum/mailbox-consumer-status.enum';
import { MailboxProcuratorStatus } from './enum/mailbox-procurator-status.enum';
import { MailboxProcurator } from './entities/mailbox-procurator.entity';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsService', () => {
    it('returns only active mailbox assignments for a consumer', async () => {
        const assignment = { id: 5 } as MailboxConsumer;
        const manager = {
            existsBy: jest.fn().mockResolvedValue(true),
            find: jest.fn().mockResolvedValue([assignment]),
        };
        const service = new AssignmentsService({
            manager,
        } as unknown as DataSource);

        await expect(
            service.getActiveMailboxesByConsumer(2),
        ).resolves.toEqual({
            hasActiveMailboxes: true,
            assignments: [assignment],
        });
        expect(manager.find).toHaveBeenCalledWith(
            MailboxConsumer,
            expect.objectContaining({
                where: {
                    consumer: { id: 2 },
                    status: MailboxConsumerStatus.ACTIVE,
                },
            }),
        );
    });

    it('filters procurators by active consumer assignments', async () => {
        const manager = {
            existsBy: jest.fn().mockResolvedValue(true),
            find: jest.fn().mockResolvedValue([]),
        };
        const service = new AssignmentsService({
            manager,
        } as unknown as DataSource);

        await expect(
            service.getActiveProcuratorsByConsumer(2),
        ).resolves.toEqual({
            hasProcurators: false,
            assignments: [],
        });
        expect(manager.find).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                where: {
                    status: MailboxProcuratorStatus.ACTIVE,
                    mailboxConsumer: {
                        consumer: { id: 2 },
                        status: MailboxConsumerStatus.ACTIVE,
                    },
                },
            }),
        );
    });

    it('rejects a procurator owned by another consumer', async () => {
        const manager = {
            findOne: jest
                .fn()
                .mockResolvedValueOnce({
                    id: 5,
                    status: MailboxConsumerStatus.ACTIVE,
                    consumer: { id: 2 },
                })
                .mockResolvedValueOnce({
                    id: 9,
                    consumer: { id: 3 },
                }),
        };
        const dataSource = {
            transaction: jest.fn((callback) => callback(manager)),
        } as unknown as DataSource;
        const service = new AssignmentsService(dataSource);

        await expect(service.assignProcurator(5, 9)).rejects.toThrow(
            'El procurador no pertenece al consumidor de esta casilla',
        );
        expect(manager.findOne).toHaveBeenNthCalledWith(
            2,
            expect.any(Function),
            expect.objectContaining({
                where: expect.objectContaining({
                    id: 9,
                    deleted_at: expect.anything(),
                }),
            }),
        );
    });

    it('returns active non-deleted procurators by mailbox', async () => {
        const relation = { id: 8 } as MailboxProcurator;
        const manager = {
            existsBy: jest.fn().mockResolvedValue(true),
            find: jest.fn().mockResolvedValue([relation]),
        };
        const service = new AssignmentsService({
            manager,
        } as unknown as DataSource);

        await expect(
            service.getActiveProcuratorsByMailbox(4),
        ).resolves.toEqual([relation]);
        expect(manager.find).toHaveBeenCalledWith(
            MailboxProcurator,
            expect.objectContaining({
                where: expect.objectContaining({
                    status: MailboxProcuratorStatus.ACTIVE,
                    mailboxConsumer: {
                        mailbox: { id: 4 },
                        status: MailboxConsumerStatus.ACTIVE,
                    },
                    procurator: {
                        deleted_at: expect.anything(),
                    },
                }),
            }),
        );
    });

    it('impide crear dos asignaciones activas para una casilla', async () => {
        const manager = {
            findOne: jest.fn().mockResolvedValue({ id: 1 } as Mailbox),
            findOneBy: jest.fn().mockResolvedValue({ id: 10 }),
        };
        const dataSource = {
            transaction: jest.fn((callback) => callback(manager)),
        } as unknown as DataSource;
        const service = new AssignmentsService(dataSource);

        await expect(service.assignConsumerToMailbox(1, 2)).rejects.toBeInstanceOf(
            ConflictException,
        );
    });

    it('crea una asignación activa cuando la casilla está libre', async () => {
        const mailbox = { id: 1 } as Mailbox;
        const consumer = { id: 2 } as Consumer;
        const created = {
            id: 5,
            mailbox,
            consumer,
            status: MailboxConsumerStatus.ACTIVE,
        } as MailboxConsumer;
        const manager = {
            findOne: jest.fn().mockResolvedValue(mailbox),
            findOneBy: jest
                .fn()
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(consumer),
            create: jest.fn().mockReturnValue(created),
            save: jest.fn().mockResolvedValue(created),
        };
        const dataSource = {
            transaction: jest.fn((callback) => callback(manager)),
        } as unknown as DataSource;
        const service = new AssignmentsService(dataSource);

        const result = await service.assignConsumerToMailbox(1, 2);

        expect(result).toBe(created);
        expect(manager.create).toHaveBeenCalledWith(
            MailboxConsumer,
            expect.objectContaining({
                mailbox,
                consumer,
                status: MailboxConsumerStatus.ACTIVE,
            }),
        );
    });
});
