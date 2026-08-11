import { ApiProperty } from "@nestjs/swagger";
import { MailboxSite } from "src/mailbox/enum/mailbox.enum";

export class CreateMailboxDto {
    @ApiProperty()
    mail_number: string;

    @ApiProperty()
    consumerId: number;

    @ApiProperty()
    mailboxSite: MailboxSite;
}