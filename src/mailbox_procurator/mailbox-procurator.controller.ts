import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AssignMailboxProcuratorDto } from './dtos/assign-mailbox-procurator.dto';
import { MailboxProcurator } from './mailbox-procurator.entity';
import { MailboxProcuratorService } from './mailbox-procurator.service';

@Controller('mailbox-consumers/:mailboxConsumerId/procurators')
export class MailboxProcuratorController {
    constructor(private readonly service: MailboxProcuratorService) {}

    @Post()
    assign(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
        @Body() dto: AssignMailboxProcuratorDto,
    ): Promise<MailboxProcurator> {
        return this.service.assignProcurator(mailboxConsumerId, dto.procuratorId);
    }

    @Delete(':procuratorId')
    remove(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
        @Param('procuratorId', ParseIntPipe) procuratorId: number,
    ): Promise<MailboxProcurator> {
        return this.service.removeProcurator(mailboxConsumerId, procuratorId);
    }

    @Get('active')
    getActive(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
    ): Promise<MailboxProcurator[]> {
        return this.service.getActiveProcurators(mailboxConsumerId);
    }

    @Get('history')
    getHistory(
        @Param('mailboxConsumerId', ParseIntPipe) mailboxConsumerId: number,
    ): Promise<MailboxProcurator[]> {
        return this.service.getProcuratorHistory(mailboxConsumerId);
    }
}
