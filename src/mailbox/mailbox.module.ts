import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Mailbox } from "./mailbox.entity";
import { Consumer } from "src/consumer/consumer.entity";

import { MailboxService } from "./mailbox.service";
import { MailboxController } from "./mailbox.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Mailbox,
            Consumer,
        ]),
    ],
    controllers: [MailboxController],
    providers: [MailboxService],
    exports: [MailboxService],
})
export class MailboxModule {}