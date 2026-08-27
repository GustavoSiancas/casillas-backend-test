import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
    MailboxItem,
    MailboxItemAccessStatus,
    MailboxItemStatus,
} from './entites/mailbox-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { CreateMailboxItemDto } from './dto/create-mailbox-item.dto';
import { MailboxConsumer } from 'src/modules/mailbox/assignments/entities/mailbox-consumer.entity';
import { MailboxConsumerStatus } from 'src/modules/mailbox/assignments/enum/mailbox-consumer-status.enum';
import { MailboxConsumerStatusReason } from 'src/modules/mailbox/assignments/enum/mailbox-consumer-status-reason.enum';

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

            const assignment = await manager.findOne(MailboxConsumer, {
                where: {
                    mailbox: { id: mailboxId },
                    status: MailboxConsumerStatus.ACTIVE,
                },
                relations: { consumer: true },
            });

            const accessStatus = !assignment
                ? MailboxItemAccessStatus.UNASSIGNED
                : assignment.statusReason === MailboxConsumerStatusReason.PAID
                  ? MailboxItemAccessStatus.VISIBLE
                  : MailboxItemAccessStatus.BLOCKED_UNPAID;

            return manager.save(
                manager.create(MailboxItem, {
                    title: dto.title,
                    description: dto.description,
                    mailbox,
                    mailboxConsumer: assignment ?? null,
                    status: MailboxItemStatus.RECEIVED,
                    accessStatus,
                    receivedAt: new Date(),
                }),
            );
        });
    }

    async getMailboxItemById(id: number): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
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
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
            order: { receivedAt: 'DESC' },
        });
    }

    async getVisibleItemsByConsumer(
        consumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository.find({
            where: {
                accessStatus: MailboxItemAccessStatus.VISIBLE,
                mailboxConsumer: {
                    consumer: { id: consumerId },
                    status: MailboxConsumerStatus.ACTIVE,
                },
            },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
            order: { receivedAt: 'DESC' },
        });
    }

    async updateMailboxItemStatusAsCollaborator(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
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
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
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
