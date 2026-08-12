import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Procurator } from 'src/consumer/types/procurator/procurator.entity';
import {
    MailboxConsumer,
    MailboxConsumerStatus,
} from 'src/mailbox_consumer/mailbox-consumer.entity';
import { DataSource } from 'typeorm';
import {
    MailboxProcurator,
    MailboxProcuratorStatus,
} from './mailbox-procurator.entity';

@Injectable()
export class MailboxProcuratorService {
    constructor(private readonly dataSource: DataSource) {}

    async assignProcurator(
        mailboxConsumerId: number,
        procuratorId: number,
    ): Promise<MailboxProcurator> {
        return this.dataSource.transaction(async (manager) => {
            const assignment = await manager.findOne(MailboxConsumer, {
                where: { id: mailboxConsumerId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!assignment) {
                throw new NotFoundException('Asignación de casilla no encontrada');
            }
            if (assignment.status !== MailboxConsumerStatus.ACTIVE) {
                throw new ConflictException('La asignación de casilla no está activa');
            }

            const procurator = await manager.findOneBy(Procurator, {
                id: procuratorId,
            });
            if (!procurator) {
                throw new NotFoundException('Procurador no encontrado');
            }

            const current = await manager.findOneBy(MailboxProcurator, {
                mailboxConsumer: { id: mailboxConsumerId },
                procurator: { id: procuratorId },
                status: MailboxProcuratorStatus.ACTIVE,
            });
            if (current) {
                throw new ConflictException(
                    'El procurador ya está activo en esta asignación',
                );
            }

            return manager.save(
                manager.create(MailboxProcurator, {
                    mailboxConsumer: assignment,
                    procurator,
                    assignedAt: new Date(),
                    unassignedAt: null,
                    status: MailboxProcuratorStatus.ACTIVE,
                }),
            );
        });
    }

    async removeProcurator(
        mailboxConsumerId: number,
        procuratorId: number,
    ): Promise<MailboxProcurator> {
        return this.dataSource.transaction(async (manager) => {
            const relation = await manager.findOne(MailboxProcurator, {
                where: {
                    mailboxConsumer: { id: mailboxConsumerId },
                    procurator: { id: procuratorId },
                    status: MailboxProcuratorStatus.ACTIVE,
                },
                lock: { mode: 'pessimistic_write' },
            });
            if (!relation) {
                throw new NotFoundException('Asignación activa no encontrada');
            }

            relation.status = MailboxProcuratorStatus.INACTIVE;
            relation.unassignedAt = new Date();
            return manager.save(relation);
        });
    }

    getActiveProcurators(mailboxConsumerId: number): Promise<MailboxProcurator[]> {
        return this.dataSource.manager.find(MailboxProcurator, {
            where: {
                mailboxConsumer: { id: mailboxConsumerId },
                status: MailboxProcuratorStatus.ACTIVE,
            },
            relations: { procurator: true },
        });
    }

    getProcuratorHistory(mailboxConsumerId: number): Promise<MailboxProcurator[]> {
        return this.dataSource.manager.find(MailboxProcurator, {
            where: { mailboxConsumer: { id: mailboxConsumerId } },
            relations: { procurator: true },
            order: { assignedAt: 'DESC' },
        });
    }
}
