import { Injectable } from '@nestjs/common';
import { MailboxItem, MailboxItemStatus } from './mailbox-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailbox } from 'src/mailbox/mailbox.entity';
import { CreateMailboxItemDto } from './dtos/create-mailbox-item.dto';

@Injectable()
export class MailboxItemService {
    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,

        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>
    ) {}

    async createMailboxItem(dto: CreateMailboxItemDto): Promise<MailboxItem> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id: dto.mailboxId },
        });
        
        if (!mailbox) {
            throw new Error(`Mailbox with ID ${dto.mailboxId} not found`);
        }

        const mailboxItem = this.mailboxItemRepository.create({
            title: dto.title,
            description: dto.description,
            mailbox: mailbox,
        });

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async getMailboxItemById(id: number): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new Error(`Mailbox item with ID ${id} not found`);
        }

        return mailboxItem;
    }

    async getAllMailboxItems(): Promise<MailboxItem[]> {
        return await this.mailboxItemRepository.find();
    }

    async getMailboxItemsByMailboxId(mailboxId: number): Promise<MailboxItem[]> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id: mailboxId },
        });

        if (!mailbox) {
            throw new Error(`Mailbox with ID ${mailboxId} not found`);
        }

        return await this.mailboxItemRepository.find({
            where: { mailbox: { id: mailboxId } },
        });
    }

    async getMailboxItemsByConsumerId(
        consumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository
            .createQueryBuilder('mailboxItem')
            .innerJoin('mailboxItem.mailbox', 'mailbox')
            .innerJoin('mailbox.consumer', 'consumer')
            .where('consumer.id = :consumerId', { consumerId })
            .andWhere('mailbox.deletedAt IS NULL')
            .andWhere('mailboxItem.deletedAt IS NULL')
            .getMany();
    }

    async updateMailboxItemStatusAsCollaborator(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new Error(`Mailbox item with ID ${id} not found`);
        }

        const previousStatus = mailboxItem.status;

        if (mailboxItem.status === MailboxItemStatus.DRAFT && nextStatus === MailboxItemStatus.RECEIVED) {
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.RECEIVED && nextStatus === MailboxItemStatus.ON_VIEW) {
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.ON_VIEW && nextStatus === MailboxItemStatus.REQUESTED) {
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.REQUESTED && nextStatus === MailboxItemStatus.DELIVERED) {
            mailboxItem.status = nextStatus;
        } else {
            throw new Error(`Invalid status transition from ${previousStatus} to ${nextStatus}`);
        }

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async updateMailboxItemStatusAsConsumer(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new Error(`Mailbox item with ID ${id} not found`);
        }

        const previousStatus = mailboxItem.status;

        if (mailboxItem.status === MailboxItemStatus.ON_VIEW && nextStatus === MailboxItemStatus.REQUESTED) {
            mailboxItem.status = nextStatus;
        } else {
            throw new Error(`Invalid status transition from ${previousStatus} to ${nextStatus}`);
        }

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async deleteMailboxItem(id: number): Promise<void> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new Error(`Mailbox item with ID ${id} not found`);
        }

        if (mailboxItem.status !== MailboxItemStatus.DRAFT) {
            throw new Error(`Cannot delete mailbox item with ID ${id} because its status is not DRAFT`);
        }

        await this.mailboxItemRepository.remove(mailboxItem);
    }
}