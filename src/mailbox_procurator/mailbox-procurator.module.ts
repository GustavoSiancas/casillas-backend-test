import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procurator } from 'src/consumer/types/procurator/procurator.entity';
import { MailboxConsumer } from 'src/mailbox_consumer/mailbox-consumer.entity';
import { MailboxProcuratorController } from './mailbox-procurator.controller';
import { MailboxProcurator } from './mailbox-procurator.entity';
import { MailboxProcuratorService } from './mailbox-procurator.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MailboxProcurator,
            MailboxConsumer,
            Procurator,
        ]),
    ],
    controllers: [MailboxProcuratorController],
    providers: [MailboxProcuratorService],
})
export class MailboxProcuratorModule {}
