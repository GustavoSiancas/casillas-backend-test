import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Mailbox, MailboxStatus } from "./mailbox.entity";
import { Consumer } from "src/consumer/consumer.entity";
import { CreateMailboxDto } from "./dtos/create-mailbox.dto";
import { PaymentsService } from "src/payments/payments.service";

@Injectable()
export class MailboxService {
    constructor(
        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>,

        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,

        private readonly paymentService: PaymentsService,
    ) {}

    async createMailbox(dto: CreateMailboxDto): Promise<Mailbox> {
        const consumer = await this.consumerRepository.findOne({
            where: {
                id: dto.consumerId,
            },
        });

        if (!consumer) {
            throw new NotFoundException(
                `Consumer with ID ${dto.consumerId} not found`,
            );
        }

        const existingMailbox = await this.mailboxRepository.findOne({
            where: {
                consumer: {
                    id: dto.consumerId,
                },
                mailboxSite: dto.mailboxSite,
            },
        });

        if (existingMailbox) {
            throw new ConflictException(
                "Mailbox already exists for this consumer and site",
            );
        }

        const mailbox = this.mailboxRepository.create({
            mail_number: dto.mail_number,
            consumer,
            mailboxSite: dto.mailboxSite,
        });

        try {
            return this.mailboxRepository.save(mailbox);
        } catch (error: any) {
            if (
                error.code === "23505" ||
                error.code === "ER_DUP_ENTRY"
            ) {
                throw new ConflictException(
                    "Mailbox already exists for this consumer and site",
                );
            }

            throw error;
        }
    }

    async getAllMailboxes(): Promise<Mailbox[]> {
        return this.mailboxRepository.find();
    }

    async getMailboxById(id: number): Promise<Mailbox> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id },
        });

        if (!mailbox) {
            throw new NotFoundException(
                `Mailbox with ID ${id} not found`,
            );
        }

        return mailbox;
    }

    async deleteMailbox(id: number): Promise<void> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id },
        });

        if (!mailbox) {
            throw new NotFoundException(
                `Mailbox with ID ${id} not found`,
            );
        }

        await this.mailboxRepository.softDelete(id);
    }

    async getMailboxesByConsumer(
        consumerId: number,
    ): Promise<Mailbox[]> {
        const consumer = await this.consumerRepository.findOne({
            where: {
                id: consumerId,
            },
        });

        if (!consumer) {
            throw new NotFoundException(
                `Consumer with ID ${consumerId} not found`,
            );
        }

        return this.mailboxRepository.find({
            where: {
                consumer: {
                    id: consumerId,
                },
            },
        });
    }

    // Ejecutar cada 24 horas
    async validateMailboxPayments(): Promise<void> {
        const mailboxes = await this.mailboxRepository.find();

        const mailboxesToUpdate: Mailbox[] = [];

        for (const mailbox of mailboxes) {
            const monthsOnDebt =
                await this.paymentService.getMonthsOnDebt(mailbox.id);

            if (
                monthsOnDebt > 3 &&
                mailbox.status === MailboxStatus.ACTIVE
            ) {
                mailbox.status = MailboxStatus.INACTIVE;
                mailboxesToUpdate.push(mailbox);
            } else if (
                monthsOnDebt <= 3 &&
                mailbox.status === MailboxStatus.INACTIVE
            ) {
                mailbox.status = MailboxStatus.ACTIVE;
                mailboxesToUpdate.push(mailbox);
            }
        }

        if (mailboxesToUpdate.length > 0) {
            await this.mailboxRepository.save(mailboxesToUpdate);
        }
    }
}