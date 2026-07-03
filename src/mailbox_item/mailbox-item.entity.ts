import { Mailbox } from "src/mailbox/mailbox.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum MailboxItemStatus {
    ENTERED = "ENTERED",
    ACTIVE = "ACTIVE",
    VIEWED = "VIEWED",
    RECEIVED = "RECEIVED",
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

    @Column()
    description: string;

    @Column(
        { 
        type: "enum", enum: MailboxItemStatus, default: MailboxItemStatus.ENTERED 
        }
    )
    status: MailboxItemStatus;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}