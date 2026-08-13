import { MailboxConsumer } from './mailbox-consumer.entity';
import { Procurator } from 'src/modules/mailbox/procurator/procurator.entity';
import { MailboxProcuratorStatus } from '../enum/mailbox-procurator-status.enum';

import {
    Column,
    Check,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';



@Entity('mailbox_procurator')
@Check(
    'CHK_mailbox_procurator_dates',
    '`unassignedAt` IS NULL OR `unassignedAt` >= `assignedAt`',
)
@Index('IDX_mailbox_procurator_assignment_status', [
    'mailboxConsumer',
    'status',
])
@Index('IDX_mailbox_procurator_procurator', ['procurator'])
export class MailboxProcurator {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => MailboxConsumer,
        (mailboxConsumer) => mailboxConsumer.mailboxProcurators,
        { nullable: false, onDelete: 'RESTRICT' },
    )
    @JoinColumn({ name: 'mailbox_consumer_id' })
    mailboxConsumer: MailboxConsumer;

    @ManyToOne(
        () => Procurator,
        (procurator) => procurator.mailboxProcurators,
        { nullable: false, onDelete: 'RESTRICT' },
    )
    @JoinColumn({ name: 'procurator_id' })
    procurator: Procurator;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    assignedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    unassignedAt: Date | null;

    @Column({
        type: 'enum',
        enum: MailboxProcuratorStatus,
        default: MailboxProcuratorStatus.ACTIVE,
    })
    status: MailboxProcuratorStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
