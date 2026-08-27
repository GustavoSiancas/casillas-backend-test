import { ApiProperty } from '@nestjs/swagger';
import { MailboxSite } from '../enum/mailbox.enum';
import { Mailbox } from '../mailbox.entity';
import { MailboxStatus } from '../enum/mailbox-status.enum';

export class MailboxResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    mailNumber: number;

    @ApiProperty({ enum: MailboxSite })
    mailboxSite: MailboxSite;

    @ApiProperty({ enum: MailboxStatus })
    status: MailboxStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static fromEntity(mailbox: Mailbox): MailboxResponseDto {
        return {
            id: mailbox.id,
            mailNumber: mailbox.mail_number,
            mailboxSite: mailbox.mailboxSite,
            status: mailbox.status,
            createdAt: mailbox.createdAt,
            updatedAt: mailbox.updatedAt,
        };
    }
}
