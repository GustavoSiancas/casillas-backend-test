import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MailboxItem } from "./mailbox-item.entity";
import { Collaborator } from "src/modules/extra/collaborator/collaborator.entity";
import { Procurator } from "src/modules/mailbox/procurator/procurator.entity";

export enum MailboxItemDeliverableType{
    USER='USER',
    PROCURATOR='PROCURATOR'
}

@Entity('mailbox_item_deliverable') 
export class MailboxItemDeliverable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @OneToOne(() => MailboxItem, mailboxitem => mailboxitem.mailboxItemDeliverable)
    @JoinColumn({
        name: "mailbox_item_id"
    })
    mailboxItem: MailboxItem;

    @ManyToOne(() => Collaborator, collaborator => collaborator.mailboxItemDeliverables)
    @JoinColumn({
        name: "collaborator_id"
    })
    collaborator: Collaborator;

    //los procuradores pueden ser nulos
    @ManyToOne(() => Procurator, procurator => procurator.mailboxItemDeliverables, { nullable: true })
    @JoinColumn({
        name: "procurator_id"
    })
    procurator: Procurator;

    //no es necesario a la data de los receiver

    @Column(
        { 
        type: "enum", enum: MailboxItemDeliverableType, default: MailboxItemDeliverableType.USER
        }
    )
    deliverableType: MailboxItemDeliverableType;

    @Column({
        type: "datetime",
    })
    deliverdAt: Date;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}