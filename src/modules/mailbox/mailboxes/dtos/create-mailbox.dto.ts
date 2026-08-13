import { ApiProperty } from "@nestjs/swagger";
import { MailboxSite } from "src/modules/mailbox/mailboxes/enum/mailbox.enum";
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateMailboxDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mail_number: string;

    @ApiProperty({ enum: MailboxSite })
    @IsEnum(MailboxSite)
    mailboxSite: MailboxSite;
}
