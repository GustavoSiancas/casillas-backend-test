import { MailboxConsumer } from "src/mailbox_consumer/mailbox-consumer.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MailboxItemDeliverable } from "./mailbox_item_deliverable/mailbox-item-deliverable.entity";
import { Mailbox } from "src/mailbox/mailbox.entity";

export enum MailboxItemStatus {
    RECEIVED = "RECEIVED", // RECIBIDO POR EL AREA DE CASILLAS
    ON_VIEW = "ON_VIEW", // EN VISTA POR EL CONSUMIDOR
    REQUESTED = "REQUESTED", // SOLICITADO POR EL CONSUMIDOR
    DELIVERED = "DELIVERED", // ENTREGADO
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
    mailboxConsumer: MailboxConsumer;

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
