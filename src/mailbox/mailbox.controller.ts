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

    @Get()
    async getAllMailboxes() {
        return this.mailboxService.getAllMailboxes();
    }

    @Get(':id')
    async getMailboxById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.mailboxService.getMailboxById(id);
    }

    @Get('consumer/:consumerId')
    async getMailboxesByConsumer(
        @Param('consumerId', ParseIntPipe) consumerId: number,
    ) {
        return this.mailboxService.getMailboxesByConsumer(
            consumerId,
        );
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