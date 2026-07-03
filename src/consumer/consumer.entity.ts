import { Mailbox } from "src/mailbox/mailbox.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
    cal: string;

    @Column()
    dni: string;

    @Column(
        {
            type: 'enum',
            enum: Sex
        }
    )
    sex: Sex;

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