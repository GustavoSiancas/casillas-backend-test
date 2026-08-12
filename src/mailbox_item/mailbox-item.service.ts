import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MailboxItem, MailboxItemStatus } from './mailbox-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailbox } from 'src/mailbox/mailbox.entity';
import { CreateMailboxItemDto } from './dtos/create-mailbox-item.dto';
import { DataSource } from 'typeorm';
import { MailboxConsumer, MailboxConsumerStatus } from 'src/mailbox_consumer/mailbox-consumer.entity';

@Injectable()
export class MailboxItemService {
    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,

        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>,

        private readonly dataSource: DataSource,
    ) {}

    async createMailboxItem(
        mailboxId: number,
        dto: CreateMailboxItemDto,
    ): Promise<MailboxItem> {
        return this.dataSource.transaction(async (manager) => {
            const mailbox = await manager.findOne(Mailbox, {
                where: { id: mailboxId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!mailbox) {
                throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
            }

            const assignment = await manager.findOneBy(MailboxConsumer, {
                mailbox: { id: mailboxId },
                status: MailboxConsumerStatus.ACTIVE,
            });
            if (!assignment) {
                throw new ConflictException(
                    'La casilla no tiene un consumidor activo',
                );
            }

            return manager.save(
                manager.create(MailboxItem, {
                    title: dto.title,
                    description: dto.description,
                    mailboxConsumer: assignment,
                    receivedAt: new Date(),
                }),
            );
        });
    }

    async getMailboxItemById(id: number): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
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
            throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
        }

        return await this.mailboxItemRepository.find({
            where: { mailboxConsumer: { mailbox: { id: mailboxId } } },
            relations: { mailboxConsumer: true },
        });
    }

    async getItemsByMailboxConsumer(
        mailboxConsumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository.find({
            where: { mailboxConsumer: { id: mailboxConsumerId } },
            order: { receivedAt: 'DESC' },
        });
    }

    async getMailboxItemsByConsumerId(
        consumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository
            .createQueryBuilder('mailboxItem')
            .innerJoin('mailboxItem.mailboxConsumer', 'mailboxConsumer')
            .innerJoin('mailboxConsumer.consumer', 'consumer')
            .innerJoin('mailboxConsumer.mailbox', 'mailbox')
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
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        const previousStatus = mailboxItem.status;

        if (mailboxItem.status === MailboxItemStatus.RECEIVED && nextStatus === MailboxItemStatus.ON_VIEW) {
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.ON_VIEW && nextStatus === MailboxItemStatus.REQUESTED) {
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.REQUESTED && nextStatus === MailboxItemStatus.DELIVERED) {
            mailboxItem.status = nextStatus;
        } else {
            throw new ConflictException(`Invalid status transition from ${previousStatus} to ${nextStatus}`);
        }

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async updateMailboxItemStatusAsConsumer(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        const previousStatus = mailboxItem.status;

        if (mailboxItem.status === MailboxItemStatus.ON_VIEW && nextStatus === MailboxItemStatus.REQUESTED) {
            mailboxItem.status = nextStatus;
        } else {
            throw new ConflictException(`Invalid status transition from ${previousStatus} to ${nextStatus}`);
        }

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async deleteMailboxItem(id: number): Promise<void> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        await this.mailboxItemRepository.softRemove(mailboxItem);
    }
}
