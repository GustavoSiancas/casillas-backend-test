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
    Post,
    Put,
    Query,
} from "@nestjs/common";

import { MailboxService } from "./mailbox.service";
import { CreateMailboxDto } from "./dto/create-mailbox.dto";
import { MailboxResponseDto } from './dto/mailbox.response.dto';
import { UpdateMailboxStatusDto } from './dto/update-mailbox-status.dto';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { MailboxStatus } from './enum/mailbox-status.enum';
import { MailboxSite } from './enum/mailbox.enum';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

@Controller("mailbox")
export class MailboxController {
    constructor(
        private readonly mailboxService: MailboxService,
    ) {}

    @Get('sites')
    @ApiOkResponse({
        description: 'Available mailbox sites',
        schema: {
            type: 'array',
            items: { type: 'string', enum: Object.values(MailboxSite) },
        },
    })
    getMailboxSites(): MailboxSite[] {
        return this.mailboxService.getMailboxSites();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createMailbox(
        @Body() dto: CreateMailboxDto,
    ): Promise<MailboxResponseDto> {
        const mailbox = await this.mailboxService.createMailbox(dto);
        return MailboxResponseDto.fromEntity(mailbox);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: MailboxStatus })
    @ApiQuery({ name: 'mail_number', required: false, type: Number })
    @ApiQuery({ name: 'mailboxSite', required: false, enum: MailboxSite })
    async getAllMailboxes(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status', new ParseEnumPipe(MailboxStatus, { optional: true }))
        status?: MailboxStatus,
        @Query('mail_number', new ParseIntPipe({ optional: true }))
        mail_number?: number,
        @Query(
            'mailboxSite',
            new ParseEnumPipe(MailboxSite, { optional: true }),
        )
        mailboxSite?: MailboxSite,
    ): Promise<PaginatedResponse<MailboxResponseDto>> {
        const normalizedPage = Math.max(page, 1);
        const normalizedLimit = Math.min(Math.max(limit, 1), 100);
        const result = await this.mailboxService.getAllMailboxes(
            normalizedPage,
            normalizedLimit,
            status,
            mail_number,
            mailboxSite,
        );
        return new PaginatedResponse(
            result.data.map(MailboxResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Put(':id/status')
    async putMailboxStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMailboxStatusDto,
    ): Promise<MailboxResponseDto> {
        const mailbox = await this.mailboxService.putMailboxStatus(
            id,
            dto.status,
        );
        return MailboxResponseDto.fromEntity(mailbox);
    }

    @Delete(':id')
    async deleteMailbox(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.mailboxService.deleteMailbox(id);

        return {
            message: 'Mailbox deleted successfully',
        };
    }
}
