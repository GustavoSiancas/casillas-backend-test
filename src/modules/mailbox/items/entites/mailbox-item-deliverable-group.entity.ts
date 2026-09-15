import { Collaborator } from 'src/modules/extra/collaborator/collaborator.entity';
import { MailboxConsumer } from 'src/modules/mailbox/assignments/entities/mailbox-consumer.entity';
import { Procurator } from 'src/modules/mailbox/procurator/procurator.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { MailboxItemDeliverable } from './mailbox-item-deliverable.entity';

export enum MailboxItemDeliverableType {
    USER = 'USER',
    PROCURATOR = 'PROCURATOR',
}

@Entity('mailbox_item_deliverable_group')
export class MailboxItemDeliverableGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(
        () => Collaborator,
        (collaborator) => collaborator.mailboxItemDeliverableGroups,
        { nullable: false, onDelete: 'RESTRICT' },
    )
    @JoinColumn({ name: 'collaborator_id' })
    collaborator: Collaborator;

    @ManyToOne(() => MailboxConsumer, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'mailbox_consumer_id' })
    mailboxConsumer: MailboxConsumer;

    @ManyToOne(
        () => Procurator,
        (procurator) => procurator.mailboxItemDeliverableGroups,
        { nullable: true, onDelete: 'RESTRICT' },
    )
    @JoinColumn({ name: 'procurator_id' })
    procurator: Procurator | null;

    @Column({
        type: 'enum',
        enum: MailboxItemDeliverableType,
        default: MailboxItemDeliverableType.USER,
    })
    deliverableType: MailboxItemDeliverableType;

    @Column({ name: 'receipt_image_url', type: 'varchar', nullable: true })
    receiptImageUrl: string | null;

    @Column({ type: 'datetime' })
    deliveredAt: Date;

    @OneToMany(
        () => MailboxItemDeliverable,
        (deliverable) => deliverable.deliveryGroup,
    )
    items: MailboxItemDeliverable[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
