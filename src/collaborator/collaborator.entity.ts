import { MailboxSite } from "src/mailbox/enum/mailbox.enum";
import { Users } from "src/user/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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