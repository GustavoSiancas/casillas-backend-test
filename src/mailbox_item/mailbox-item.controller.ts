import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Patch,
    Post,
} from "@nestjs/common";

import { MailboxItemService } from "./mailbox-item.service";
import { CreateMailboxItemDto } from "./dtos/create-mailbox-item.dto";
import { MailboxItem, MailboxItemStatus } from "./mailbox-item.entity";

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
        return this.mailboxItemService.createMailboxItem(dto);
    }

    @Get()
    async getAllMailboxItems(): Promise<MailboxItem[]> {
        return this.mailboxItemService.getAllMailboxItems();
    }

    @Get(":id")
    async getMailboxItemById(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<MailboxItem> {
        return this.mailboxItemService.getMailboxItemById(id);
    }

    @Get("mailbox/:mailboxId")
    async getMailboxItemsByMailboxId(
        @Param("mailboxId", ParseIntPipe) mailboxId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemService.getMailboxItemsByMailboxId(mailboxId);
    }

    @Get("consumer/:consumerId")
    async getMailboxItemsByConsumerId(
        @Param("consumerId", ParseIntPipe) consumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemService.getMailboxItemsByConsumerId(consumerId);
    }

    @Patch(":id/collaborator/status/:status")
    async updateMailboxItemStatusAsCollaborator(
        @Param("id", ParseIntPipe) id: number,
        @Param("status", new ParseEnumPipe(MailboxItemStatus))
        status: MailboxItemStatus,
    ): Promise<MailboxItem> {
        return this.mailboxItemService.updateMailboxItemStatusAsCollaborator(
            id,
            status,
        );
    }

    @Patch(":id/consumer/status/:status")
    async updateMailboxItemStatusAsConsumer(
        @Param("id", ParseIntPipe) id: number,
        @Param("status", new ParseEnumPipe(MailboxItemStatus))
        status: MailboxItemStatus,
    ): Promise<MailboxItem> {
        return this.mailboxItemService.updateMailboxItemStatusAsConsumer(
            id,
            status,
        );
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMailboxItem(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<void> {
        await this.mailboxItemService.deleteMailboxItem(id);
    }
}