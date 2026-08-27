import { Consumer } from 'src/modules/mailbox/consumer/entities/consumer.entity';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { MailboxItem } from 'src/modules/mailbox/items/entites/mailbox-item.entity';
import { MailboxProcurator } from './mailbox-procurator.entity';
import { MailboxConsumerStatus } from '../enum/mailbox-consumer-status.enum';
import { MailboxConsumerStatusReason } from '../enum/mailbox-consumer-status-reason.enum';

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

// la logica de la casilla es que un consumidor esta conectado a la casilla ahora 
// si en caso esta casilla no esta asignada a ningun consumidor, entonces el consumidor no tiene casilla asignada
// si esta asignada pero ojo no esta pagada, sigue perteneciendo al consumidor pero la logica de negocio es q recibe items pero no los muestra nunca
// ACTIVE y PAID = esta perfecto
// ACTIVE y UNPAID = significa que sigue asignado pero no pagan osea recibe items pero no los muestra
// INACTIVE y PAID = significa que ya no esta asignado pero si pago, osea que cerro la casilla de la mejor manera
// INACTIVE y UNPAID = significa que ya no esta asignado y no pago, osea que cerro la casilla de la peor manera

@Entity('mailbox_consumer')
@Check(
    'CHK_mailbox_consumer_dates',
    '`unassignedAt` IS NULL OR `unassignedAt` >= `assignedAt`',
)
@Index('IDX_mailbox_consumer_mailbox_status', ['mailbox', 'status'])
@Index('IDX_mailbox_consumer_consumer_status', ['consumer', 'status'])
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
    
    // The date when the mailbox was assigned to the consumer
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    assignedAt: Date;

    // The date when the mailbox was unassigned from the consumer, if applicable
    @Column({ type: 'datetime', nullable: true })
    unassignedAt: Date | null; // if is null, then the mailbox is still assigned to the consumer as active
    // The reason for the status of the mailbox consumer
    @Column({
        type: 'enum',
        enum: MailboxConsumerStatusReason,
        default: MailboxConsumerStatusReason.PAID,
    })
    statusReason: MailboxConsumerStatusReason;

    // The status of the mailbox consumer

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
