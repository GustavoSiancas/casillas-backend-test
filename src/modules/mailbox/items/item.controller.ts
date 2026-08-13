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

import { MailboxItemService } from "./item.service";
import { CreateMailboxItemDto } from "./dto/create-mailbox-item.dto";
import { MailboxItemStatus } from "./entites/mailbox-item.entity";
import { MailboxItemResponseDto } from './dto/mailbox-item.response.dto';

@Controller("mailbox-items")
export class MailboxItemController {
    constructor(
        private readonly mailboxItemService: MailboxItemService,
    ) {}

    @Post("mailbox/:mailboxId")
    @HttpCode(HttpStatus.CREATED)
    async createMailboxItem(
        @Param("mailboxId", ParseIntPipe) mailboxId: number,
        @Body() dto: CreateMailboxItemDto,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.createMailboxItem(
            mailboxId,
            dto,
        );
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Get("assignment/:mailboxConsumerId")
    async getItemsByMailboxConsumer(
        @Param("mailboxConsumerId", ParseIntPipe) mailboxConsumerId: number,
    ): Promise<MailboxItemResponseDto[]> {
        const items = await this.mailboxItemService.getItemsByMailboxConsumer(
            mailboxConsumerId,
        );
        return items.map(MailboxItemResponseDto.fromEntity);
    }

    @Get(":id")
    async getMailboxItemById(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.getMailboxItemById(id);
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Patch(":id/collaborator/status/:status")
    async updateMailboxItemStatusAsCollaborator(
        @Param("id", ParseIntPipe) id: number,
        @Param("status", new ParseEnumPipe(MailboxItemStatus))
        status: MailboxItemStatus,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.updateMailboxItemStatusAsCollaborator(
            id,
            status,
        );
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Patch(":id/consumer/status/:status")
    async updateMailboxItemStatusAsConsumer(
        @Param("id", ParseIntPipe) id: number,
        @Param("status", new ParseEnumPipe(MailboxItemStatus))
        status: MailboxItemStatus,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.updateMailboxItemStatusAsConsumer(
            id,
            status,
        );
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMailboxItem(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<void> {
        await this.mailboxItemService.deleteMailboxItem(id);
    }
}
