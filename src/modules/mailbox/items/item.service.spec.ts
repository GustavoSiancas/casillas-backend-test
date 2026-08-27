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
});
