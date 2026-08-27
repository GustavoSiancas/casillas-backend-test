import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MailboxStatus } from '../enum/mailbox-status.enum';

export class UpdateMailboxStatusDto {
    @ApiProperty({ enum: MailboxStatus })
    @IsEnum(MailboxStatus)
    status: MailboxStatus;
}
