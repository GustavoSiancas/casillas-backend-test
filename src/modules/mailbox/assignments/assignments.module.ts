import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { Procurator } from 'src/modules/mailbox/procurator/procurator.entity';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { MailboxConsumer } from './entities/mailbox-consumer.entity';
import { MailboxProcurator } from './entities/mailbox-procurator.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MailboxConsumer,
            MailboxProcurator,
            Mailbox,
            Consumer,
            Procurator,
        ]),
    ],
    controllers: [AssignmentsController],
    providers: [AssignmentsService],
    exports: [AssignmentsService],
})
export class AssignmentsModule {}
