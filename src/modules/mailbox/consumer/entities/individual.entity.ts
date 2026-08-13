import { Consumer } from "src/modules/mailbox/consumer/entities/consumer.entity";
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Individual {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Consumer, consumer => consumer.individual)
    @JoinColumn({
        name: "consumer_id"
    })
    consumer: Consumer;
    
    @Column()
    full_name: string;

    @Column()
    dni: string;

    @Column()
    cal_number: string;
}