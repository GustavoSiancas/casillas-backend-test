import { Mailbox } from "src/mailbox/mailbox.entity";
import { Users } from "src/user/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Business } from "./types/business/business.entity";
import { Individual } from "./types/individual/individual.entity";
import { LawFirm } from "./types/law_firm/law-firm.entity";

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

    @Column(
        {
            nullable: true
        }
    )
    legal_representative: string;

    //data contact
    
    @Column()
    legal_adress: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    principal_phone: string;    

    // relations
    @OneToOne(() => Business, business => business.consumer) // mapped 
    business: Business;

    @OneToOne(() => Individual, individual => individual.consumer) // mapped
    individual: Individual;

    @OneToOne(() => LawFirm, lawFirm => lawFirm.consumer) // mapped
    lawFirm: LawFirm;

    @OneToMany(() => Mailbox, mailbox => mailbox.consumer)
    mailboxs: Mailbox[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn() 
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}