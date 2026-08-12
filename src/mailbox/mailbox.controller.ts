import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
} from "@nestjs/common";

import { MailboxService } from "./mailbox.service";
import { CreateMailboxDto } from "./dtos/create-mailbox.dto";
import { MailboxResponseDto } from './dtos/mailbox.response.dto';

@Controller("mailbox")
export class MailboxController {
    constructor(
        private readonly mailboxService: MailboxService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createMailbox(
        @Body() dto: CreateMailboxDto,
    ): Promise<MailboxResponseDto> {
        const mailbox = await this.mailboxService.createMailbox(dto);
        return MailboxResponseDto.fromEntity(mailbox);
    }

    @Get()
    async getAllMailboxes(): Promise<MailboxResponseDto[]> {
        const mailboxes = await this.mailboxService.getAllMailboxes();
        return mailboxes.map(MailboxResponseDto.fromEntity);
    }

    @Get(':id')
    async getMailboxById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<MailboxResponseDto> {
        const mailbox = await this.mailboxService.getMailboxById(id);
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
