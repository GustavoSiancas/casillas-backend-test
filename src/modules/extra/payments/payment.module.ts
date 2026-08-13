import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payments } from "./payments.entity";
import { Mailbox } from "src/modules/mailbox/mailboxes/mailbox.entity";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payments,
            Mailbox,
        ]),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}