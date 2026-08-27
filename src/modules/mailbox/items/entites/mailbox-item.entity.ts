import { MailboxConsumer } from "src/modules/mailbox/assignments/entities/mailbox-consumer.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MailboxItemDeliverable } from "./mailbox-item-deliverable.entity";
import { Mailbox } from "src/modules/mailbox/mailboxes/mailbox.entity";

export enum MailboxItemStatus {
    RECEIVED = "RECEIVED", // RECIBIDO POR EL AREA DE CASILLAS
    ON_VIEW = "ON_VIEW", // EN VISTA POR EL CONSUMIDOR
    REQUESTED = "REQUESTED", // SOLICITADO POR EL CONSUMIDOR
    DELIVERED = "DELIVERED", // ENTREGADO
}

export enum MailboxItemAccessStatus {
    VISIBLE = 'VISIBLE',
    BLOCKED_UNPAID = 'BLOCKED_UNPAID',
    UNASSIGNED = 'UNASSIGNED',
}

@Entity('mailbox_item') 
export class MailboxItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(
        () => MailboxConsumer,
        (mailboxConsumer) => mailboxConsumer.items,
        { nullable: true, onDelete: 'RESTRICT' },
    )
    @JoinColumn({
        name: "mailbox_consumer_id"
    })
    mailboxConsumer: MailboxConsumer | null;

    @ManyToOne(
        ()=>Mailbox,
        (mailbox)=>mailbox.mailboxItems,
        {nullable: false, onDelete: 'RESTRICT'}
    )
    @JoinColumn({
        name: "mailbox_id"
    })
    mailbox: Mailbox;

    @OneToOne(() => MailboxItemDeliverable, mailboxItemDeliverable => mailboxItemDeliverable.mailboxItem)
    mailboxItemDeliverable: MailboxItemDeliverable;

    @Column()
    description: string;

    @Column(
        { 
        type: "enum", enum: MailboxItemStatus, default: MailboxItemStatus.RECEIVED
        }
    )
    status: MailboxItemStatus;

    @Column({
        type: 'enum',
        enum: MailboxItemAccessStatus,
        default: MailboxItemAccessStatus.UNASSIGNED,
    })
    accessStatus: MailboxItemAccessStatus;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    receivedAt: Date;

    @Column({
        type: "boolean",
        default: true
    })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
