import { ApiProperty } from "@nestjs/swagger";
import { MailboxSite } from "../mailbox.entity";

export class CreateMailboxDto {
    @ApiProperty()
    mail_number: string;

    @ApiProperty()
    consumerId: number;

    @ApiProperty()
    mailboxSite: MailboxSite;
}