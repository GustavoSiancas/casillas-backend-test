import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    MailboxItem,
    MailboxItemAccessStatus,
    MailboxItemStatus,
} from './entites/mailbox-item.entity';

@Injectable()
export class MailboxItemStatusScheduler {
    private readonly logger = new Logger(MailboxItemStatusScheduler.name);

    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,
    ) {}

    @Cron('1 0 * * *', { timeZone: 'America/Lima' })
    async makeVisiblePendingItems(): Promise<void> {
        const result = await this.mailboxItemRepository
            .createQueryBuilder()
            .update(MailboxItem)
            .set({ status: MailboxItemStatus.ON_VIEW })
            .where('status = :pendingStatus', {
                pendingStatus: MailboxItemStatus.PENDING,
            })
            .andWhere('accessStatus = :accessStatus', {
                accessStatus: MailboxItemAccessStatus.VISIBLE,
            })
            .andWhere('visibleAt IS NOT NULL')
            .andWhere('visibleAt <= :now', { now: new Date() })
            .execute();

        this.logger.log(
            `Items pendientes movidos a ON_VIEW: ${result.affected ?? 0}`,
        );
    }
}
