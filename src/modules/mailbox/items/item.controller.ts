import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";

import { MailboxItemService } from "./item.service";
import { CreateMailboxItemDto } from "./dto/create-mailbox-item.dto";
import {
    MailboxItemAccessStatus,
    MailboxItemStatus,
} from "./entites/mailbox-item.entity";
import { MailboxItemResponseDto } from './dto/mailbox-item.response.dto';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { ApiQuery } from '@nestjs/swagger';

@Controller("mailbox-items")
export class MailboxItemController {
    constructor(
        private readonly mailboxItemService: MailboxItemService,
    ) {}

    @Get('collaborator/consumer/:consumerId/active-mailbox-items')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'mailboxConsumerId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: MailboxItemStatus })
    @ApiQuery({ name: 'fromDate', required: false, type: String })
    @ApiQuery({ name: 'toDate', required: false, type: String })
    async getActiveMailboxItemsForCollaborator(
        @Param('consumerId', ParseIntPipe) consumerId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('mailboxConsumerId', new ParseIntPipe({ optional: true }))
        mailboxConsumerId?: number,
        @Query('status', new ParseEnumPipe(MailboxItemStatus, { optional: true }))
        status?: MailboxItemStatus,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result =
            await this.mailboxItemService.getActiveMailboxItemsForConsumer(
                consumerId,
                Math.max(page, 1),
                Math.min(Math.max(limit, 1), 100),
                [
                    MailboxItemAccessStatus.VISIBLE,
                    MailboxItemAccessStatus.BLOCKED_UNPAID,
                ],
                mailboxConsumerId,
                status,
                fromDate,
                toDate,
            );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Get('consumer/:consumerId/active-mailbox-items')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'mailboxConsumerId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: MailboxItemStatus })
    @ApiQuery({ name: 'fromDate', required: false, type: String })
    @ApiQuery({ name: 'toDate', required: false, type: String })
    async getActiveMailboxItemsForUser(
        @Param('consumerId', ParseIntPipe) consumerId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('mailboxConsumerId', new ParseIntPipe({ optional: true }))
        mailboxConsumerId?: number,
        @Query('status', new ParseEnumPipe(MailboxItemStatus, { optional: true }))
        status?: MailboxItemStatus,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result =
            await this.mailboxItemService.getActiveMailboxItemsForConsumer(
                consumerId,
                Math.max(page, 1),
                Math.min(Math.max(limit, 1), 100),
                [MailboxItemAccessStatus.VISIBLE],
                mailboxConsumerId,
                status,
                fromDate,
                toDate,
            );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

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

    @Get('consumer/:consumerId/visible')
    async getVisibleItemsByConsumer(
        @Param('consumerId', ParseIntPipe) consumerId: number,
    ): Promise<MailboxItemResponseDto[]> {
        const items = await this.mailboxItemService.getVisibleItemsByConsumer(
            consumerId,
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
