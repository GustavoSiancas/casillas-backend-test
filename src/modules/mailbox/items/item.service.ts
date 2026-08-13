import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MailboxItem, MailboxItemStatus } from './entites/mailbox-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { CreateMailboxItemDto } from './dto/create-mailbox-item.dto';
import { MailboxConsumer, MailboxConsumerStatus } from 'src/modules/mailbox/assignments/entities/mailbox-consumer.entity';

@Injectable()
export class MailboxItemService {
    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,

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
            where: { id },
            relations: { mailboxConsumer: true },
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        return mailboxItem;
    }

    async getItemsByMailboxConsumer(
        mailboxConsumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository.find({
            where: { mailboxConsumer: { id: mailboxConsumerId } },
            relations: { mailboxConsumer: true },
            order: { receivedAt: 'DESC' },
        });
    }

    async updateMailboxItemStatusAsCollaborator(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id },
            relations: { mailboxConsumer: true },
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
            where: { id },
            relations: { mailboxConsumer: true },
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
