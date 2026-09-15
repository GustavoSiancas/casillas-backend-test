import { ConflictException, Injectable } from '@nestjs/common';
import { MailboxItemStatus } from './entites/mailbox-item.entity';

@Injectable()
export class MailboxItemStatusService {
    isAvaiableTochangeStatusItem(
        actualStatus: MailboxItemStatus,
        newStatus: MailboxItemStatus,
    ): true {
        const allowedTransitions: Partial<
            Record<MailboxItemStatus, MailboxItemStatus>
        > = {
            [MailboxItemStatus.PENDING]: MailboxItemStatus.ON_VIEW,
            [MailboxItemStatus.ON_VIEW]: MailboxItemStatus.REQUESTED,
            [MailboxItemStatus.REQUESTED]: MailboxItemStatus.DELIVERED,
        };

        if (allowedTransitions[actualStatus] === newStatus) {
            return true;
        }

        throw new ConflictException(
            `No puede cambiar de estado de ${actualStatus} a ${newStatus} porque no esta mapeado`,
        );
    }
}
