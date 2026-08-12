import { Consumer } from 'src/consumer/consumer.entity';
import { Mailbox } from 'src/mailbox/mailbox.entity';
import { MailboxItem } from 'src/mailbox_item/mailbox-item.entity';
import { MailboxProcurator } from 'src/mailbox_procurator/mailbox-procurator.entity';
import {
    Column,
    Check,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum MailboxConsumerStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity('mailbox_consumer')
@Check(
    'CHK_mailbox_consumer_dates',
    '`unassignedAt` IS NULL OR `unassignedAt` >= `assignedAt`',
)
@Index('IDX_mailbox_consumer_mailbox_status', ['mailbox', 'status'])
@Index('IDX_mailbox_consumer_consumer', ['consumer'])
export class MailboxConsumer {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Mailbox, (mailbox) => mailbox.mailboxConsumers, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'mailbox_id' })
    mailbox: Mailbox;

    @ManyToOne(() => Consumer, (consumer) => consumer.mailboxConsumers, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'consumer_id' })
    consumer: Consumer;

    @OneToMany(() => MailboxItem, (item) => item.mailboxConsumer)
    items: MailboxItem[];

    @OneToMany(
        () => MailboxProcurator,
        (mailboxProcurator) => mailboxProcurator.mailboxConsumer,
    )
    mailboxProcurators: MailboxProcurator[];

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    assignedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    unassignedAt: Date | null;

    @Column({
        type: 'enum',
        enum: MailboxConsumerStatus,
        default: MailboxConsumerStatus.ACTIVE,
    })
    status: MailboxConsumerStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
