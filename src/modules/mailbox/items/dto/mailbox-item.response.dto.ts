import { ApiProperty } from '@nestjs/swagger';
import {
    MailboxItem,
    MailboxItemAccessStatus,
    MailboxItemStatus,
} from '../entites/mailbox-item.entity';
import { MailboxSite } from '../../mailboxes/enum/mailbox.enum';

export class MailboxItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    mailboxConsumerId: number | null;

    @ApiProperty({ nullable: true })
    consumerId: number | null;

    @ApiProperty()
    mailboxId: number;

    @ApiProperty({ enum: MailboxSite })
    sede: MailboxSite;

    @ApiProperty()
    mail_number: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ enum: MailboxItemStatus })
    status: MailboxItemStatus;

    @ApiProperty({ enum: MailboxItemAccessStatus })
    accessStatus: MailboxItemAccessStatus;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    receivedAt: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static fromEntity(item: MailboxItem): MailboxItemResponseDto {
        return {
            id: item.id,
            mailboxConsumerId: item.mailboxConsumer?.id ?? null,
            consumerId: item.mailboxConsumer?.consumer?.id ?? null,
            mailboxId: item.mailbox.id,
            sede: item.mailbox.mailboxSite,
            mail_number: item.mailbox.mail_number,
            title: item.title,
            description: item.description,
            status: item.status,
            accessStatus: item.accessStatus,
            isActive: item.isActive,
            receivedAt: item.receivedAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
