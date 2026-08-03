import { Consumer } from "src/consumer/consumer.entity";
import { Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Individual {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Consumer, consumer => consumer.individual)
    consumer: Consumer;
    
    full_name: string;

    dni: string;

    cal_number: string;

    // relations with user
}