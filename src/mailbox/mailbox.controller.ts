import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from "@nestjs/common";

import { MailboxService } from "./mailbox.service";
import { CreateMailboxDto } from "./dtos/create-mailbox.dto";
import { Mailbox } from "./mailbox.entity";

@Controller("mailbox")
export class MailboxController {
    constructor(
        private readonly mailboxService: MailboxService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createMailbox(
        @Body() dto: CreateMailboxDto,
    ): Promise<Mailbox> {
        return await this.mailboxService.createMailbox(dto);
    }
}