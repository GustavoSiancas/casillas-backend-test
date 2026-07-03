import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Mailbox } from "./mailbox.entity";
import { Consumer } from "src/consumer/consumer.entity";
import { CreateMailboxDto } from "./dtos/create-mailbox.dto";

@Injectable()
export class MailboxService {
    constructor(
        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>,

        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
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
}