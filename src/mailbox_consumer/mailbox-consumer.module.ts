import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { Mailbox } from 'src/mailbox/mailbox.entity';
import { MailboxProcurator } from 'src/mailbox_procurator/mailbox-procurator.entity';
import { MailboxConsumerController } from './mailbox-consumer.controller';
import { MailboxConsumer } from './mailbox-consumer.entity';
import { MailboxConsumerService } from './mailbox-consumer.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MailboxConsumer,
            MailboxProcurator,
            Mailbox,
            Consumer,
        ]),
    ],
    controllers: [MailboxConsumerController],
    providers: [MailboxConsumerService],
    exports: [MailboxConsumerService],
})
export class MailboxConsumerModule {}
