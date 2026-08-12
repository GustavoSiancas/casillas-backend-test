import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Mailbox } from "./mailbox.entity";
import { MailboxConsumer } from "src/mailbox_consumer/mailbox-consumer.entity";

import { MailboxService } from "./mailbox.service";
import { MailboxController } from "./mailbox.controller";
import { PaymentsModule } from "src/payments/payment.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Mailbox,
            MailboxConsumer,
        ]),
        PaymentsModule,
    ],
    controllers: [MailboxController],
    providers: [MailboxService],
    exports: [MailboxService],
})
export class MailboxModule {}
