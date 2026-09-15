import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Collaborator } from 'src/modules/extra/collaborator/collaborator.entity';
import { MailboxItemStatus } from './entites/mailbox-item.entity';
import { MailboxItem } from './entites/mailbox-item.entity';
import { MailboxItemDeliverable } from './entites/mailbox-item-deliverable.entity';
import {
    MailboxItemDeliverableGroup,
    MailboxItemDeliverableType,
} from './entites/mailbox-item-deliverable-group.entity';
import { Procurator } from 'src/modules/mailbox/procurator/procurator.entity';
import { DataSource, EntityManager, In } from 'typeorm';
import { DeliverMailboxItemsDto } from './dto/deliver-mailbox-items.dto';
import { MailboxItemStatusService } from './mailbox-item-status.service';

@Injectable()
export class MailboxItemDeliveryService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly mailboxItemStatusService: MailboxItemStatusService,
    ) {}

    async deliverMailboxItems(dto: DeliverMailboxItemsDto): Promise<{
        deliveryGroup: MailboxItemDeliverableGroup;
        deliveredItems: MailboxItem[];
    }> {
        return this.dataSource.transaction(async (manager) => {
            const collaborator = await manager.findOneBy(Collaborator, {
                id: dto.collaboratorId,
            });
            if (!collaborator) {
                throw new NotFoundException('Colaborador no encontrado');
            }

            const deliverableType =
                dto.deliverableType ?? MailboxItemDeliverableType.USER;
            const procurator = await this.getProcurator(
                manager,
                dto.procuratorId,
                deliverableType,
            );
            const items = await manager.find(MailboxItem, {
                where: { id: In(dto.mailboxItemIds) },
                relations: { mailboxConsumer: true, mailboxItemDeliverable: true },
                lock: { mode: 'pessimistic_write' },
            });

            if (items.length !== dto.mailboxItemIds.length) {
                throw new NotFoundException('Uno o mas items no fueron encontrados');
            }
            if (items.some((item) => item.mailboxConsumer === null)) {
                throw new ConflictException(
                    'No se puede entregar un item sin mailbox_consumer asignado',
                );
            }

            const mailboxConsumerId = items[0].mailboxConsumer!.id;
            if (
                items.some(
                    (item) => item.mailboxConsumer!.id !== mailboxConsumerId,
                )
            ) {
                throw new BadRequestException(
                    'Todos los items deben pertenecer al mismo mailbox_consumer',
                );
            }
            if (items.some((item) => item.mailboxItemDeliverable)) {
                throw new ConflictException('Uno o mas items ya fueron entregados');
            }

            for (const item of items) {
                this.mailboxItemStatusService.isAvaiableTochangeStatusItem(
                    item.status,
                    MailboxItemStatus.DELIVERED,
                );
            }

            const deliveredAt = new Date();
            const deliveryGroup = await manager.save(
                manager.create(MailboxItemDeliverableGroup, {
                    title:
                        dto.title ?? `Entrega de ${items.length} notificacion(es)`,
                    collaborator,
                    mailboxConsumer: items[0].mailboxConsumer!,
                    procurator,
                    deliverableType,
                    receiptImageUrl: dto.receiptImageUrl ?? null,
                    deliveredAt,
                }),
            );

            await manager.save(
                items.map((item) =>
                    manager.create(MailboxItemDeliverable, {
                        mailboxItem: item,
                        deliveryGroup,
                    }),
                ),
            );

            for (const item of items) {
                item.status = MailboxItemStatus.DELIVERED;
            }
            const deliveredItems = await manager.save(items);

            return { deliveryGroup, deliveredItems };
        });
    }

    private async getProcurator(
        manager: EntityManager,
        procuratorId: number | undefined,
        deliverableType: MailboxItemDeliverableType,
    ): Promise<Procurator | null> {
        if (deliverableType === MailboxItemDeliverableType.PROCURATOR && !procuratorId) {
            throw new BadRequestException(
                'procuratorId es obligatorio para una entrega a procurador',
            );
        }
        if (!procuratorId) return null;

        const procurator = await manager.findOneBy(Procurator, { id: procuratorId });
        if (!procurator) {
            throw new NotFoundException('Procurador no encontrado');
        }
        return procurator;
    }
}
