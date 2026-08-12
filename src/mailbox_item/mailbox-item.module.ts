import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailboxItem } from "./mailbox-item.entity";
import { Mailbox } from "src/mailbox/mailbox.entity";
import { MailboxItemService } from "./mailbox-item.service";
import { MailboxItemController } from "./mailbox-item.controller";
import { Procurator } from "src/consumer/types/procurator/procurator.entity";
import { MailboxItemDeliverable } from "./mailbox_item_deliverable/mailbox-item-deliverable.entity";
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
