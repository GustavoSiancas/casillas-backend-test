import { Users } from "src/modules/extra/users/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Business } from "./business.entity";
import { Individual } from "./individual.entity";
import { LawFirm } from "./law-firm.entity";
import { MailboxConsumer } from "src/modules/mailbox/assignments/entities/mailbox-consumer.entity";
import { ConsumerType } from "../enum/consumer-type.enum";
import { Procurator } from "../../procurator/procurator.entity";

@Entity('consumer')
@Index('UQ_consumer_number_id', ['numberID'], { unique: true })
@Index('IDX_consumer_name', ['name'])
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

    @Column({ name: 'number_id' })
    numberID: string;

    @Column()
    name: string;

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

    @OneToMany(
        () => MailboxConsumer,
        (mailboxConsumer) => mailboxConsumer.consumer,
    )
    mailboxConsumers: MailboxConsumer[];

    @OneToMany(() => Procurator, (procurator) => procurator.consumer)
    procurators: Procurator[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn() 
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
