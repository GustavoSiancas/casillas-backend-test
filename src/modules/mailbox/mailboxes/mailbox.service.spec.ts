import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailboxStatus } from './enum/mailbox-status.enum';
import { MailboxSite } from './enum/mailbox.enum';
import { Mailbox } from './mailbox.entity';
import { MailboxService } from './mailbox.service';

describe('MailboxService', () => {
    let repository: jest.Mocked<Repository<Mailbox>>;
    let service: MailboxService;

    beforeEach(() => {
        repository = {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
        } as unknown as jest.Mocked<Repository<Mailbox>>;

        service = new MailboxService(repository);
    });

    it('returns all available mailbox sites', () => {
        expect(service.getMailboxSites()).toEqual(Object.values(MailboxSite));
    });

    it('validates duplicates by mail number and site', async () => {
        repository.findOne.mockResolvedValue({ id: 1 } as Mailbox);

        await expect(
            service.createMailbox({
                mail_number: 101,
                mailboxSite: MailboxSite.MIRAFLORES,
            }),
        ).rejects.toBeInstanceOf(ConflictException);

        expect(repository.findOne).toHaveBeenCalledWith({
            where: {
                mail_number: 101,
                mailboxSite: MailboxSite.MIRAFLORES,
            },
        });
    });

    it('allows the same mail number when no mailbox exists at that site', async () => {
        const mailbox = {
            mail_number: 101,
            mailboxSite: MailboxSite.MIRAFLORES,
        } as Mailbox;
        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue(mailbox);
        repository.save.mockResolvedValue(mailbox);

        await expect(
            service.createMailbox({
                mail_number: 101,
                mailboxSite: MailboxSite.MIRAFLORES,
            }),
        ).resolves.toBe(mailbox);
    });

    it('translates a concurrent unique constraint violation into a conflict', async () => {
        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue({} as Mailbox);
        repository.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

        await expect(
            service.createMailbox({
                mail_number: 101,
                mailboxSite: MailboxSite.MIRAFLORES,
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('lists mailboxes with pagination and filters', async () => {
        const mailbox = { id: 1 } as Mailbox;
        repository.findAndCount.mockResolvedValue([[mailbox], 11]);

        await expect(
            service.getAllMailboxes(
                2,
                5,
                undefined,
                101,
                MailboxSite.MIRAFLORES,
            ),
        ).resolves.toEqual({
            data: [mailbox],
            pagination: {
                page: 2,
                limit: 5,
                total: 11,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
            },
        });

        expect(repository.findAndCount).toHaveBeenCalledWith({
            where: {
                mail_number: 101,
                mailboxSite: MailboxSite.MIRAFLORES,
            },
            skip: 5,
            take: 5,
            order: { updatedAt: 'DESC' },
        });
    });

    it('updates the mailbox status', async () => {
        const mailbox = { id: 1, status: MailboxStatus.ACTIVE } as Mailbox;
        repository.findOne.mockResolvedValue(mailbox);
        repository.save.mockImplementation(async (entity) => entity as Mailbox);

        const result = await service.putMailboxStatus(
            1,
            MailboxStatus.INACTIVE,
        );

        expect(result.status).toBe(MailboxStatus.INACTIVE);
        expect(repository.save).toHaveBeenCalledWith(mailbox);
    });
});
