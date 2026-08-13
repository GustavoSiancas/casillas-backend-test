import { ApiProperty } from "@nestjs/swagger";
import { MailboxSite } from "src/modules/mailbox/mailboxes/enum/mailbox.enum";

export class CreateCollaboratorDto {
    @ApiProperty()
    names: string;

    @ApiProperty()
    lastnames: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    mailboxSite: MailboxSite;
}