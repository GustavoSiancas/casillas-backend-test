import { MailboxSite } from "src/mailbox/enum/mailbox.enum";
import { MailboxItemDeliverable } from "src/modules/mailbox/items/entites/mailbox-item-deliverable.entity";
import { Users } from "src/modules/extra/users/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('collaborator')
export class Collaborator {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    names: string;

    @Column()
    lastnames: string;

    @OneToOne(() => Users, user => user.collaborator)
    @JoinColumn({
        name: "user_id"
    })
    user: Users;

    @OneToMany(
        () => MailboxItemDeliverable,
        (deliverable) => deliverable.collaborator,
    )
    mailboxItemDeliverables: MailboxItemDeliverable[];

    @Column(
        {
            type: 'enum',
            enum: MailboxSite
        }
    )
    mailboxSite: MailboxSite;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
    
}