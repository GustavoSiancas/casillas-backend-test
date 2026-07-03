import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payments } from "./payments.entity";
import { Repository } from "typeorm";
import { Mailbox } from "src/mailbox/mailbox.entity";
import { CreatePaymentDto } from "./dtos/create-payment.dto";


@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payments)
        private readonly paymentsRepository: Repository<Payments>,

        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>
    ) {}

    async createPayment(dto: CreatePaymentDto): Promise<Payments> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id: dto.mailboxId },
        });

        if (!mailbox) {
            throw new Error(`Mailbox with ID ${dto.mailboxId} not found`);
        }

        const payment = this.paymentsRepository.create({
            mailbox: mailbox,
            amount: dto.amount,
        });

        return await this.paymentsRepository.save(payment);
    }
}