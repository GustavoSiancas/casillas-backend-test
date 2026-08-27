import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import { MailboxSite } from "src/modules/mailbox/mailboxes/enum/mailbox.enum";
import { IsEnum, IsInt, Min } from 'class-validator';

export class CreateMailboxDto {
    @ApiProperty({ type: Number, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    mail_number: number;

    @ApiProperty({ enum: MailboxSite })
    @IsEnum(MailboxSite)
    mailboxSite: MailboxSite;
}
