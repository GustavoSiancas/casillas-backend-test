import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Mailbox } from "./mailbox.entity";
import { MailboxConsumer } from "src/modules/mailbox/assignments/entities/mailbox-consumer.entity";

import { MailboxService } from "./mailbox.service";
import { MailboxController } from "./mailbox.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Mailbox,
            MailboxConsumer,
        ]),
    ],
    controllers: [MailboxController],
    providers: [MailboxService],
    exports: [MailboxService],
})
export class MailboxModule {}
