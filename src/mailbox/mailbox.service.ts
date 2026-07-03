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

        private paymentService: PaymentsService
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
            return await this.mailboxRepository.save(mailbox);
        } catch (error: any) {
            if (error.code === "23505") {
                throw new ConflictException(
                    "Mailbox already exists for this consumer and site",
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                throw new ConflictException(
                    "Mailbox already exists for this consumer and site",
                );
            }

            throw error;
        }
    }

    //every 24h
    async validateMailboxPayments(){
        // todos los mailboxes 
        const listMailboxes = await this.mailboxRepository.find();

        const listMailboxestoUpdate: Mailbox[] = [];

        for (const mailbox of listMailboxes) {
            const monthsOnDebt = await this.paymentService.getMonthsOnDebt(mailbox.id);
            // si los meses de deuda son mayores a 3, cambiar el estado del mailbox de active a inactive
            if (monthsOnDebt > 3 && mailbox.status === MailboxStatus.ACTIVE) {
                mailbox.status = MailboxStatus.INACTIVE;
                listMailboxestoUpdate.push(mailbox);
            } // si los meses de deuda son menores o iguales a 3, cambiar el estado del mailbox de inactive a active
            else if (monthsOnDebt <= 3 && mailbox.status === MailboxStatus.INACTIVE) {
                mailbox.status = MailboxStatus.ACTIVE;
                listMailboxestoUpdate.push(mailbox);
            }
            // si los meses son mayores a 3 y el estado es inactive, no hacer nada
            // si los meses son menores o iguales a 3 y el estado es active, no hacer nada
        }

        if (listMailboxestoUpdate.length > 0) {
            await this.mailboxRepository.save(listMailboxestoUpdate);
        }

    }
}