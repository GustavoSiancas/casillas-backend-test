import { Consumer } from "src/consumer/consumer.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("business")
export class Business {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Consumer, consumer => consumer.business)
    @JoinColumn({ name: "consumer_id" })
    consumer: Consumer;

    @Column()
    ruc: string;

    @Column()
    social_reason: string;
}