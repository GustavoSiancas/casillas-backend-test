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
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';

import {
    JudicialImportResult,
    MailboxItemService,
} from "./item.service";
import { CreateMailboxItemDto } from "./dto/create-mailbox-item.dto";
import {
    MailboxItemAccessStatus,
    MailboxItemStatus,
} from "./entites/mailbox-item.entity";
import { MailboxItemResponseDto } from './dto/mailbox-item.response.dto';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ImportJudicialMailboxItemsDto } from './dto/import-judicial-mailbox-items.dto';
import { CreateAdministrativeMailboxItemDto } from './dto/create-administrative-mailbox-item.dto';
import { AdministrativeMailboxItemData } from './entites/administrative-mailbox-item-data.entity';
import { MailboxSite } from '../mailboxes/enum/mailbox.enum';
import { JudicialMailboxItemInstitution } from './entites/judicial-mailbox-item-data.entity';

@Controller("mailbox-items")
export class MailboxItemController {
    constructor(
        private readonly mailboxItemService: MailboxItemService,
    ) {}

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'mailboxNumber', required: false, type: Number })
    @ApiQuery({ name: 'caseNumber', required: false, type: String })
    @ApiQuery({ name: 'sede', required: false, enum: MailboxSite })
    async getAllMailboxItems(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('mailboxNumber', new ParseIntPipe({ optional: true }))
        mailboxNumber?: number,
        @Query('caseNumber') caseNumber?: string,
        @Query('sede', new ParseEnumPipe(MailboxSite, { optional: true }))
        sede?: MailboxSite,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result = await this.mailboxItemService.getAllMailboxItems(
            Math.max(page, 1),
            Math.min(Math.max(limit, 1), 100),
            mailboxNumber,
            caseNumber,
            sede,
        );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Post('judicial/import-xls')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
    @ApiConsumes('multipart/form-data')
    @ApiQuery({ name: 'sede', enum: MailboxSite, required: true })
    @ApiQuery({
        name: 'tipo',
        enum: JudicialMailboxItemInstitution,
        required: true,
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    importJudicialMailboxItems(
        @UploadedFile() file: { originalname: string; buffer: Buffer } | undefined,
        @Query('sede', new ParseEnumPipe(MailboxSite)) sede: MailboxSite,
        @Query('tipo', new ParseEnumPipe(JudicialMailboxItemInstitution))
        tipo: JudicialMailboxItemInstitution,
    ): Promise<JudicialImportResult> {
        const dto: ImportJudicialMailboxItemsDto = { sede, tipo };
        return this.mailboxItemService.importJudicialMailboxItems(file, dto);
    }

    @Post('administrative')
    @HttpCode(HttpStatus.CREATED)
    async createAdministrativeMailboxItem(
        @Body() dto: CreateAdministrativeMailboxItemDto,
    ): Promise<{
        mailboxItem: MailboxItemResponseDto;
        administrativeData: AdministrativeMailboxItemData;
    }> {
        const result =
            await this.mailboxItemService.createAdministrativeMailboxItem(dto);
        return {
            mailboxItem: MailboxItemResponseDto.fromEntity(result.mailboxItem),
            administrativeData: result.administrativeData,
        };
    }

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
