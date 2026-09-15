import { CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MailboxItem } from "./mailbox-item.entity";
import { MailboxItemDeliverableGroup } from './mailbox-item-deliverable-group.entity';

@Entity('mailbox_item_deliverable') 
export class MailboxItemDeliverable {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => MailboxItem, mailboxitem => mailboxitem.mailboxItemDeliverable)
    @JoinColumn({
        name: "mailbox_item_id"
    })
    mailboxItem: MailboxItem;

    @ManyToOne(
        () => MailboxItemDeliverableGroup,
        (deliveryGroup) => deliveryGroup.items,
        { nullable: false, onDelete: 'RESTRICT' },
    )
    @JoinColumn({ name: 'delivery_group_id' })
    deliveryGroup: MailboxItemDeliverableGroup;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
