import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payments } from "./payments.entity";
import { Repository } from "typeorm";
import { Mailbox } from "src/modules/mailbox/mailboxes/mailbox.entity";
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
            throw new NotFoundException(`Mailbox with ID ${dto.mailboxId} not found`);
        }

        const payment = this.paymentsRepository.create({
            mailbox: mailbox,
            amount: dto.amount,
        });

        return await this.paymentsRepository.save(payment);
    }

    async getPaymentsByMailbox(mailboxId: number): Promise<Payments[]> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id: mailboxId },
        });

        if (!mailbox) {
            throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
        }

        return await this.paymentsRepository.find({
            where: { mailbox: mailbox },
        });
    }

    async getMonthsOnDebt(mailboxId: number): Promise<number> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id: mailboxId },
        });

        if (!mailbox) {
            throw new NotFoundException(
                `Mailbox with ID ${mailboxId} not found`,
            );
        }

        const lastPayment = await this.paymentsRepository.findOne({
            where: {
                mailbox: {
                    id: mailboxId,
                },
            },
            order: {
                createdAt: "DESC",
            },
        });

        // Si nunca ha pagado
        if (!lastPayment) {
            return 0;
        }

        const today = new Date();
        const paymentDate = lastPayment.createdAt;

        const months =
            (today.getFullYear() - paymentDate.getFullYear()) * 12 +
            (today.getMonth() - paymentDate.getMonth());

        return Math.max(months, 0);
    }
}