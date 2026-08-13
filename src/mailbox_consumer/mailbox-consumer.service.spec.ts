import { ConflictException } from '@nestjs/common';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { Mailbox } from 'src/mailbox/mailbox.entity';
import { DataSource } from 'typeorm';
import {
    MailboxConsumer,
    MailboxConsumerStatus,
} from './mailbox-consumer.entity';
import { MailboxConsumerService } from './mailbox-consumer.service';

describe('MailboxConsumerService', () => {
    it('impide crear dos asignaciones activas para una casilla', async () => {
        const manager = {
            findOne: jest.fn().mockResolvedValue({ id: 1 } as Mailbox),
            findOneBy: jest.fn().mockResolvedValue({ id: 10 }),
        };
        const dataSource = {
            transaction: jest.fn((callback) => callback(manager)),
        } as unknown as DataSource;
        const service = new MailboxConsumerService(dataSource);

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
        const service = new MailboxConsumerService(dataSource);

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
