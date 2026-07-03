import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MailboxItem } from "./mailbox-item.entity";
import { Mailbox } from "src/mailbox/mailbox.entity";

import { MailboxItemService } from "./mailbox-item.service";
import { MailboxItemController } from "./mailbox-item.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MailboxItem,
            Mailbox,
        ]),
    ],
    controllers: [MailboxItemController],
    providers: [MailboxItemService],
    exports: [MailboxItemService],
})
export class MailboxItemModule {}