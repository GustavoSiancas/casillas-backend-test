import { Mailbox } from "src/modules/mailbox/mailboxes/mailbox.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// es una prueba de entity para payments q ojo no croe que se quede pero es para probar una funcionamiento
@Entity('payments')
export class Payments{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Mailbox, mailbox => mailbox.payments)
    @JoinColumn({
        name: "mailbox_id"
    })
    mailbox: Mailbox;

    @Column({
        type: 'decimal',
        precision: 18,
        scale: 2,
    })
    amount: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    //NUNCA SE BORRA UN PAYMENT, SOLO SE MARCA COMO ELIMINADO, PARA NO PERDER EL HISTORIAL DE PAGOS
    @DeleteDateColumn()
    deletedAt: Date;
}