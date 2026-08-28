import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { PaginationMetaResponse } from 'src/common/dtos/pages/pagination.meta.response';

@Injectable()
export class MailboxItemService {
    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,

        private readonly dataSource: DataSource,
    ) {}

    async getActiveMailboxItemsForConsumer(
        consumerId: number,
        page: number,
        limit: number,
        accessStatuses: MailboxItemAccessStatus[],
        mailboxConsumerId?: number,
        status?: MailboxItemStatus,
        fromDate?: string,
        toDate?: string,
    ): Promise<PaginatedResponse<MailboxItem>> {
        const from = this.parseFilterDate(fromDate, 'fromDate', false);
        const to = this.parseFilterDate(toDate, 'toDate', true);
        if (from && to && from > to) {
            throw new BadRequestException(
                'fromDate no puede ser posterior a toDate',
            );
        }

        const query = this.mailboxItemRepository
            .createQueryBuilder('item')
            .innerJoinAndSelect('item.mailbox', 'mailbox')
            .innerJoin(
                'mailbox.mailboxConsumers',
                'activeMailboxConsumer',
                'activeMailboxConsumer.status = :assignmentStatus',
                { assignmentStatus: MailboxConsumerStatus.ACTIVE },
            )
            .innerJoin('activeMailboxConsumer.consumer', 'consumer')
            .leftJoinAndSelect('item.mailboxConsumer', 'itemMailboxConsumer')
            .leftJoinAndSelect('itemMailboxConsumer.consumer', 'itemConsumer')
            .where('consumer.id = :consumerId', { consumerId })
            .andWhere('activeMailboxConsumer.status = :assignmentStatus', {
                assignmentStatus: MailboxConsumerStatus.ACTIVE,
            })
            .andWhere('item.accessStatus IN (:...accessStatuses)', {
                accessStatuses,
            });

        if (mailboxConsumerId !== undefined) {
            query.andWhere('activeMailboxConsumer.id = :mailboxConsumerId', {
                mailboxConsumerId,
            });
        }
        if (status !== undefined) {
            query.andWhere('item.status = :status', { status });
        }
        if (from) {
            query.andWhere('item.receivedAt >= :fromDate', { fromDate: from });
        }
        if (to) {
            query.andWhere('item.receivedAt <= :toDate', { toDate: to });
        }

        const [data, total] = await query
            .orderBy('item.receivedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return new PaginatedResponse(
            data,
            new PaginationMetaResponse(page, limit, total),
        );
    }

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
            if (mailboxItem.accessStatus !== MailboxItemAccessStatus.VISIBLE) {
                throw new ConflictException(
                    'El item no está habilitado para mostrarse al consumidor',
                );
            }
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

        if (
            mailboxItem.accessStatus !== MailboxItemAccessStatus.VISIBLE ||
            mailboxItem.mailboxConsumer?.status !==
                MailboxConsumerStatus.ACTIVE
        ) {
            throw new ConflictException(
                'El item no está disponible para el consumidor',
            );
        }

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

    private parseFilterDate(
        value: string | undefined,
        field: string,
        endOfDay: boolean,
    ): Date | undefined {
        if (!value) return undefined;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${field} debe ser una fecha válida`);
        }
        if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            date.setUTCHours(23, 59, 59, 999);
        }
        return date;
    }
}
