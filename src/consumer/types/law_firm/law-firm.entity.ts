import { Consumer } from "src/consumer/consumer.entity";
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class LawFirm {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Consumer, consumer => consumer.lawFirm)
    @JoinColumn({
        name: "consumer_id"
    })
    consumer: Consumer;

    ruc: string;

    firm_name: string; // name

}