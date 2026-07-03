import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from "@nestjs/common";

import { MailboxItemService } from "./mailbox-item.service";
import { CreateMailboxItemDto } from "./dtos/create-mailbox-item.dto";
import { MailboxItem } from "./mailbox-item.entity";

@Controller("mailbox-items")
export class MailboxItemController {
    constructor(
        private readonly mailboxItemService: MailboxItemService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createMailboxItem(
        @Body() dto: CreateMailboxItemDto,
    ): Promise<MailboxItem> {
        return await this.mailboxItemService.createMailboxItem(dto);
    }
}