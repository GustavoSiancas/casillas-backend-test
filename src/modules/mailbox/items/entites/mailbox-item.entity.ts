import { MailboxConsumer } from "src/modules/mailbox/assignments/entities/mailbox-consumer.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MailboxItemDeliverable } from "./mailbox-item-deliverable.entity";
import { Mailbox } from "src/modules/mailbox/mailboxes/mailbox.entity";
import { AdministrativeMailboxItemData } from "./administrative-mailbox-item-data.entity";
import { JudicialMailboxItemData } from "./judicial-mailbox-item-data.entity";

export enum MailboxItemStatus {
    PENDING = "PENDING",
    ON_VIEW = "ON_VIEW",
    REQUESTED = "REQUESTED",
    DELIVERED = "DELIVERED",
}

export enum MailboxItemType {
    ADMINISTRATIVE = "ADMINISTRATIVE",
    JUDICIAL = "JUDICIAL",
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
    name: string;

    @Column({ name: 'case_number', nullable: true })
    caseNumber: string | null;

    @Column({ name: 'document_date', type: 'datetime' })
    documentDate: Date;

    @Column({ name: 'mailbox_item_type', type: 'enum', enum: MailboxItemType })
    type: MailboxItemType;

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

    @OneToOne(() => AdministrativeMailboxItemData, data => data.mailboxItem)
    administrativeData: AdministrativeMailboxItemData | null;

    @OneToOne(() => JudicialMailboxItemData, data => data.mailboxItem)
    judicialData: JudicialMailboxItemData | null;

    @Column({ type: 'text', nullable: true })
    demandante: string | null;

    @Column({ type: 'text', nullable: true })
    demandado: string | null;

    @Column({ type: 'text', nullable: true })
    materia: string | null;

    @Column({ type: 'text', nullable: true })
    resolucion: string | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column(
        { 
        type: "enum", enum: MailboxItemStatus, default: MailboxItemStatus.PENDING
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

    @Column({ type: 'datetime', nullable: true })
    visibleAt: Date | null;

    @Column({ type: 'datetime', nullable: true })
    requestedAt: Date | null;

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
