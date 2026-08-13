import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { AssignMailboxConsumerDto } from './dto/assign-mailbox-consumer.dto';
import { AssignMailboxProcuratorDto } from './dto/assign-mailbox-procurator.dto';
import { MailboxConsumer } from './entities/mailbox-consumer.entity';
import { MailboxProcurator } from './entities/mailbox-procurator.entity';
import { AssignmentsService } from './assignments.service';

@Controller()
export class AssignmentsController {
    constructor(private readonly service: AssignmentsService) {}

    @Get('mailboxes/:mailboxId/details')
    getDetails(@Param('mailboxId', ParseIntPipe) mailboxId: number) {
        return this.service.getMailboxDetails(mailboxId);
    }

    @Post('mailboxes/:mailboxId/consumers/assign')
    assignConsumer(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
        @Body() dto: AssignMailboxConsumerDto,
    ): Promise<MailboxConsumer> {
        return this.service.assignConsumerToMailbox(mailboxId, dto.consumerId);
    }

    @Post('mailboxes/:mailboxId/consumers/change')
    changeConsumer(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
        @Body() dto: AssignMailboxConsumerDto,
    ): Promise<MailboxConsumer> {
        return this.service.changeMailboxConsumer(mailboxId, dto.consumerId);
    }

    @Get('mailboxes/:mailboxId/consumers/current')
    getCurrentConsumer(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
    ): Promise<MailboxConsumer> {
        return this.service.getActiveMailboxConsumer(mailboxId);
    }

    @Get('mailboxes/:mailboxId/consumers/history')
    getConsumerHistory(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
    ): Promise<MailboxConsumer[]> {
        return this.service.getMailboxHistory(mailboxId);
    }

    @Post('mailbox-consumers/:mailboxConsumerId/procurators')
    assignProcurator(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
        @Body() dto: AssignMailboxProcuratorDto,
    ): Promise<MailboxProcurator> {
        return this.service.assignProcurator(mailboxConsumerId, dto.procuratorId);
    }

    @Delete('mailbox-consumers/:mailboxConsumerId/procurators/:procuratorId')
    removeProcurator(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
        @Param('procuratorId', ParseIntPipe) procuratorId: number,
    ): Promise<MailboxProcurator> {
        return this.service.removeProcurator(mailboxConsumerId, procuratorId);
    }

    @Get('mailbox-consumers/:mailboxConsumerId/procurators/active')
    getActiveProcurators(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
    ): Promise<MailboxProcurator[]> {
        return this.service.getActiveProcurators(mailboxConsumerId);
    }

    @Get('mailbox-consumers/:mailboxConsumerId/procurators/history')
    getProcuratorHistory(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
    ): Promise<MailboxProcurator[]> {
        return this.service.getProcuratorHistory(mailboxConsumerId);
    }
}
