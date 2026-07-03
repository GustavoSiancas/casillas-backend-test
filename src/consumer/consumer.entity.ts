import { Mailbox } from "src/mailbox/mailbox.entity";
import { Users } from "src/user/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Sex {
    MALE="MALE",
    FEMALE="FEMALE"
}

    export enum ConsumerType {
        INDIVIDUAL="INDIVIDUAL",
        LAW_FIRM ="LAW_FIRM",
        BUSINESS="BUSINESS"
    }

@Entity('consumer')
export class Consumer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    names: string;

    @Column()
    dni: string;

    @OneToOne(() => Users, user => user.consumer)
    @JoinColumn({
        name: "user_id"
    })
    user: Users;

    @Column(
        {
            type: 'enum',
            enum: ConsumerType
        }
    )
    consumerType: ConsumerType;

    @OneToMany(() => Mailbox, mailbox => mailbox.consumer)
    mailboxs: Mailbox[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}