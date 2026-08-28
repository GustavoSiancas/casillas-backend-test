import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";

import { Mailbox } from "./mailbox.entity";
import { CreateMailboxDto } from "./dto/create-mailbox.dto";
import { MailboxStatus } from "./enum/mailbox-status.enum";
import { PaginatedResponse } from "src/common/dtos/pages/pagination.response";
import { PaginationMetaResponse } from "src/common/dtos/pages/pagination.meta.response";
import { MailboxSite } from "./enum/mailbox.enum";
import { MailboxConsumerStatus } from "src/modules/mailbox/assignments/enum/mailbox-consumer-status.enum";

@Injectable()
export class MailboxService {
    constructor(
        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>,
    ) {}

    getMailboxSites(): MailboxSite[] {
        return Object.values(MailboxSite);
    }

    async getMailboxBySiteAndNumber(
        mailboxSite: MailboxSite,
        mailNumber: number,
    ): Promise<Mailbox> {
        const mailbox = await this.mailboxRepository
            .createQueryBuilder('mailbox')
            .leftJoin(
                'mailbox.mailboxConsumers',
                'activeAssignment',
                'activeAssignment.status = :activeStatus',
                { activeStatus: MailboxConsumerStatus.ACTIVE },
            )
            .where('mailbox.mailboxSite = :mailboxSite', { mailboxSite })
            .andWhere('mailbox.mail_number = :mailNumber', { mailNumber })
            .andWhere('activeAssignment.id IS NULL')
            .getOne();

        if (!mailbox) {
            throw new NotFoundException(
                'Mailbox not found for the specified site and number',
            );
        }

        return mailbox;
    }

    async createMailbox(dto: CreateMailboxDto): Promise<Mailbox> {
        const existingMailbox = await this.mailboxRepository.findOne({
            where: {
                mail_number: dto.mail_number,
                mailboxSite: dto.mailboxSite,
            },
        });

        if (existingMailbox) {
            throw new ConflictException(
                "Mailbox code already exists at this site",
            );
        }

        const mailbox = this.mailboxRepository.create({
            mail_number: dto.mail_number,
            mailboxSite: dto.mailboxSite,
        });

        try {
            return await this.mailboxRepository.save(mailbox);
        } catch (error: any) {
            if (
                error.code === "23505" ||
                error.code === "ER_DUP_ENTRY"
            ) {
                throw new ConflictException(
                    "Mailbox code already exists at this site",
                );
            }

            throw error;
        }
    }

    async getAllMailboxes(
        page: number,
        limit: number,
        status?: MailboxStatus,
        mail_number?: number,
        mailboxSite?: MailboxSite,
    ): Promise<PaginatedResponse<Mailbox>> {
        const where: FindOptionsWhere<Mailbox> = {};

        if (status !== undefined) where.status = status;
        if (mail_number !== undefined) where.mail_number = mail_number;
        if (mailboxSite !== undefined) where.mailboxSite = mailboxSite;

        const [data, total] = await this.mailboxRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { updatedAt: 'DESC' },
        });

        return new PaginatedResponse(
            data,
            new PaginationMetaResponse(page, limit, total),
        );
    }

    async putMailboxStatus(id: number, status: MailboxStatus): Promise<Mailbox> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id },
        });

        if (!mailbox) {
            throw new NotFoundException(
                `Mailbox with ID ${id} not found`,
            );
        }

        mailbox.status = status;
        return this.mailboxRepository.save(mailbox);
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

}
