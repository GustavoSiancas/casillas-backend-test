import { ConflictException } from '@nestjs/common';
import { MailboxItemStatus } from './entites/mailbox-item.entity';
import { MailboxItemStatusService } from './mailbox-item-status.service';

describe('MailboxItemStatusService', () => {
    const service = new MailboxItemStatusService();

    it.each([
        [MailboxItemStatus.PENDING, MailboxItemStatus.ON_VIEW],
        [MailboxItemStatus.ON_VIEW, MailboxItemStatus.REQUESTED],
        [MailboxItemStatus.REQUESTED, MailboxItemStatus.DELIVERED],
    ])('allows %s to %s', (currentStatus, newStatus) => {
        expect(
            service.isAvaiableTochangeStatusItem(currentStatus, newStatus),
        ).toBe(true);
    });

    it('rejects a transition that is not mapped', () => {
        expect(() =>
            service.isAvaiableTochangeStatusItem(
                MailboxItemStatus.PENDING,
                MailboxItemStatus.DELIVERED,
            ),
        ).toThrow(ConflictException);
    });
});
