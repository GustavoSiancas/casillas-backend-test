import { Consumer } from "src/consumer/consumer.entity";
import { Mailbox } from "src/mailbox/mailbox.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MailboxItemDeliverable } from "./mailbox_item_deliverable/mailbox-item-deliverable.entity";

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

    @ManyToOne(() => Mailbox, mailbox => mailbox.mailboxItems)
    @JoinColumn({
        name: "mailbox_id"
    })
    mailbox: Mailbox;

    @ManyToOne(() => Consumer, consumer => consumer.mailboxItems)
    @JoinColumn({
        name: "consumer_id"
    })
    consumer: Consumer;

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