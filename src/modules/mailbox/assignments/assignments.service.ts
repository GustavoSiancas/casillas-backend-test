import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { Procurator } from 'src/modules/mailbox/procurator/procurator.entity';
import {
    MailboxProcurator,
    MailboxProcuratorStatus,
} from './entities/mailbox-procurator.entity';
import { DataSource, EntityManager } from 'typeorm';
import {
    MailboxConsumer,
    MailboxConsumerStatus,
} from './entities/mailbox-consumer.entity';

@Injectable()
export class AssignmentsService {
    constructor(private readonly dataSource: DataSource) {}

    async assignConsumerToMailbox(
        mailboxId: number,
        consumerId: number,
    ): Promise<MailboxConsumer> {
        return this.dataSource.transaction((manager) =>
            this.createAssignment(manager, mailboxId, consumerId, false),
        );
    }

    async changeMailboxConsumer(
        mailboxId: number,
        newConsumerId: number,
    ): Promise<MailboxConsumer> {
        return this.dataSource.transaction(async (manager) => {
            await this.getLockedMailbox(manager, mailboxId);

            const activeAssignment = await manager.findOne(MailboxConsumer, {
                where: {
                    mailbox: { id: mailboxId },
                    status: MailboxConsumerStatus.ACTIVE,
                },
                relations: { consumer: true },
                lock: { mode: 'pessimistic_write' },
            });

            if (!activeAssignment) {
                return this.createAssignment(
                    manager,
                    mailboxId,
                    newConsumerId,
                    true,
                );
            }

            if (activeAssignment.consumer.id === newConsumerId) {
                throw new ConflictException(
                    'El consumidor ya es el titular activo de la casilla',
                );
            }

            const unassignedAt = new Date();
            activeAssignment.status = MailboxConsumerStatus.INACTIVE;
            activeAssignment.unassignedAt = unassignedAt;
            await manager.save(activeAssignment);

            await manager.update(
                MailboxProcurator,
                {
                    mailboxConsumer: { id: activeAssignment.id },
                    status: MailboxProcuratorStatus.ACTIVE,
                },
                {
                    status: MailboxProcuratorStatus.INACTIVE,
                    unassignedAt,
                },
            );

            return this.createAssignment(
                manager,
                mailboxId,
                newConsumerId,
                true,
            );
        });
    }

    async getActiveMailboxConsumer(
        mailboxId: number,
    ): Promise<MailboxConsumer> {
        const assignment = await this.dataSource.manager.findOne(
            MailboxConsumer,
            {
                where: {
                    mailbox: { id: mailboxId },
                    status: MailboxConsumerStatus.ACTIVE,
                },
                relations: {
                    consumer: true,
                    items: true,
                    mailboxProcurators: { procurator: true },
                },
            },
        );

        if (!assignment) {
            throw new NotFoundException(
                'La casilla no tiene un consumidor activo',
            );
        }

        assignment.mailboxProcurators = assignment.mailboxProcurators.filter(
            (relation) => relation.status === MailboxProcuratorStatus.ACTIVE,
        );

        return assignment;
    }

    async getMailboxDetails(mailboxId: number): Promise<{
        mailbox: Mailbox;
        currentAssignment: MailboxConsumer | null;
        history: MailboxConsumer[];
    }> {
        const mailbox = await this.dataSource.manager.findOneBy(Mailbox, {
            id: mailboxId,
        });
        if (!mailbox) {
            throw new NotFoundException('Casilla no encontrada');
        }

        const assignments = await this.getMailboxHistory(mailboxId);
        const currentAssignment =
            assignments.find(
                (assignment) =>
                    assignment.status === MailboxConsumerStatus.ACTIVE,
            ) ?? null;

        if (currentAssignment) {
            currentAssignment.mailboxProcurators =
                currentAssignment.mailboxProcurators.filter(
                    (relation) =>
                        relation.status === MailboxProcuratorStatus.ACTIVE,
                );
        }

        return {
            mailbox,
            currentAssignment,
            history: assignments.filter(
                (assignment) =>
                    assignment.status === MailboxConsumerStatus.INACTIVE,
            ),
        };
    }

    async getMailboxHistory(mailboxId: number): Promise<MailboxConsumer[]> {
        await this.ensureMailboxExists(mailboxId);
        return this.dataSource.manager.find(MailboxConsumer, {
            where: { mailbox: { id: mailboxId } },
            relations: {
                consumer: true,
                items: true,
                mailboxProcurators: { procurator: true },
            },
            order: { assignedAt: 'DESC' },
        });
    }

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

    getActiveProcurators(
        mailboxConsumerId: number,
    ): Promise<MailboxProcurator[]> {
        return this.dataSource.manager.find(MailboxProcurator, {
            where: {
                mailboxConsumer: { id: mailboxConsumerId },
                status: MailboxProcuratorStatus.ACTIVE,
            },
            relations: { procurator: true },
        });
    }

    getProcuratorHistory(
        mailboxConsumerId: number,
    ): Promise<MailboxProcurator[]> {
        return this.dataSource.manager.find(MailboxProcurator, {
            where: { mailboxConsumer: { id: mailboxConsumerId } },
            relations: { procurator: true },
            order: { assignedAt: 'DESC' },
        });
    }

    private async createAssignment(
        manager: EntityManager,
        mailboxId: number,
        consumerId: number,
        mailboxAlreadyLocked: boolean,
    ): Promise<MailboxConsumer> {
        const mailbox = mailboxAlreadyLocked
            ? await manager.findOneByOrFail(Mailbox, { id: mailboxId })
            : await this.getLockedMailbox(manager, mailboxId);

        const activeAssignment = await manager.findOneBy(MailboxConsumer, {
            mailbox: { id: mailboxId },
            status: MailboxConsumerStatus.ACTIVE,
        });
        if (activeAssignment) {
            throw new ConflictException(
                'La casilla ya tiene un consumidor activo',
            );
        }

        const consumer = await manager.findOneBy(Consumer, { id: consumerId });
        if (!consumer) {
            throw new NotFoundException('Consumidor no encontrado');
        }

        return manager.save(
            manager.create(MailboxConsumer, {
                mailbox,
                consumer,
                assignedAt: new Date(),
                unassignedAt: null,
                status: MailboxConsumerStatus.ACTIVE,
            }),
        );
    }

    private async getLockedMailbox(
        manager: EntityManager,
        mailboxId: number,
    ): Promise<Mailbox> {
        const mailbox = await manager.findOne(Mailbox, {
            where: { id: mailboxId },
            lock: { mode: 'pessimistic_write' },
        });
        if (!mailbox) {
            throw new NotFoundException('Casilla no encontrada');
        }
        return mailbox;
    }

    private async ensureMailboxExists(mailboxId: number): Promise<void> {
        if (!(await this.dataSource.manager.existsBy(Mailbox, { id: mailboxId }))) {
            throw new NotFoundException('Casilla no encontrada');
        }
    }
}
