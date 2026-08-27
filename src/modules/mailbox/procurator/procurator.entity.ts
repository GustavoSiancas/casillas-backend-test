import { MailboxItemDeliverable } from "src/modules/mailbox/items/entites/mailbox-item-deliverable.entity";
import { MailboxProcurator } from "src/modules/mailbox/assignments/entities/mailbox-procurator.entity";
import { Consumer } from "src/modules/mailbox/consumer/entities/consumer.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum ProcuratorDocumentType {
    DNI = "DNI",
    CE = "CE",
}

@Entity('procurators')
@Unique('UQ_procurator_consumer_document', [
    'consumer',
    'document_type',
    'document_number',
])
export class Procurator {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Consumer, (consumer) => consumer.procurators, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'consumer_id' })
    consumer: Consumer;

    @Column()
    names: string;

    @Column()
    last_names: string;

    @Column({
        type: 'enum',
        enum: ProcuratorDocumentType,
    })
    document_type: ProcuratorDocumentType;

    @Column()
    document_number: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @OneToMany(() => MailboxItemDeliverable, mailboxItemDeliverable => mailboxItemDeliverable.procurator)
    mailboxItemDeliverables: MailboxItemDeliverable[];

    @OneToMany(
        () => MailboxProcurator,
        (mailboxProcurator) => mailboxProcurator.procurator,
    )
    mailboxProcurators: MailboxProcurator[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

}
