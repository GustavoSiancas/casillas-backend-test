import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AssignMailboxConsumerDto } from './dtos/assign-mailbox-consumer.dto';
import { MailboxConsumer } from './mailbox-consumer.entity';
import { MailboxConsumerService } from './mailbox-consumer.service';

@Controller('mailboxes')
export class MailboxConsumerController {
    constructor(private readonly service: MailboxConsumerService) {}

    @Get(':mailboxId/details')
    getDetails(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
    ) {
        return this.service.getMailboxDetails(mailboxId);
    }

    @Post(':mailboxId/consumers/assign')
    assign(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
        @Body() dto: AssignMailboxConsumerDto,
    ): Promise<MailboxConsumer> {
        return this.service.assignConsumerToMailbox(mailboxId, dto.consumerId);
    }

    @Post(':mailboxId/consumers/change')
    change(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
        @Body() dto: AssignMailboxConsumerDto,
    ): Promise<MailboxConsumer> {
        return this.service.changeMailboxConsumer(mailboxId, dto.consumerId);
    }

    @Get(':mailboxId/consumers/current')
    getCurrent(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
    ): Promise<MailboxConsumer> {
        return this.service.getActiveMailboxConsumer(mailboxId);
    }

    @Get(':mailboxId/consumers/history')
    getHistory(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
    ): Promise<MailboxConsumer[]> {
        return this.service.getMailboxHistory(mailboxId);
    }
}
