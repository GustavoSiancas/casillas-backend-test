import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailboxItem } from "./entites/mailbox-item.entity";
import { Mailbox } from "src/modules/mailbox/mailboxes/mailbox.entity";
import { MailboxItemService } from "./item.service";
import { MailboxItemController } from "./item.controller";
import { Procurator } from "src/modules/mailbox/procurator/procurator.entity";
import { MailboxItemDeliverable } from "./entites/mailbox-item-deliverable.entity";
import { MailboxConsumer } from "src/mailbox_consumer/mailbox-consumer.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MailboxItem,
            Mailbox,
            MailboxItemDeliverable,
            Procurator, // Add the Procurator entity to the imports
            MailboxConsumer,
        ]),
    ],
    controllers: [MailboxItemController],
    providers: [MailboxItemService],
    exports: [MailboxItemService],
})
export class MailboxItemModule {}
