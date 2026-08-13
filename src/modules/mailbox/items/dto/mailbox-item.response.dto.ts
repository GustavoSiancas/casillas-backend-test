import { ApiProperty } from '@nestjs/swagger';
import { MailboxItem, MailboxItemStatus } from '../entites/mailbox-item.entity';

export class MailboxItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    mailboxConsumerId: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ enum: MailboxItemStatus })
    status: MailboxItemStatus;

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
            mailboxConsumerId: item.mailboxConsumer.id,
            title: item.title,
            description: item.description,
            status: item.status,
            isActive: item.isActive,
            receivedAt: item.receivedAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
