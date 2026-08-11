import { Consumer } from "src/consumer/consumer.entity";
import { MailboxItemDeliverable } from "src/mailbox_item/mailbox_item_deliverable/mailbox-item-deliverable.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum ProcuratorDocumentType {
    DNI = "DNI",
    CE = "CE",
}

@Entity('procurators')
export class Procurator {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    names: string;

    @Column()
    last_names: string;

    // por ahora los procuradores solo tendran un usuario
    @ManyToOne(()=> Consumer, consumer => consumer.procurators)
    consumer: Consumer;

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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

}