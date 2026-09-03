import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MailboxItem } from './mailbox-item.entity';

@Entity('administrative_mailbox_item_data')
export class AdministrativeMailboxItemData {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => MailboxItem, item => item.administrativeData, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'mailbox_item_id' })
    mailboxItem: MailboxItem;

    @Column({ type: 'varchar', nullable: true })
    juzgado: string | null;

    @Column({ type: 'varchar', nullable: true })
    materia: string | null;

    @Column({ type: 'varchar', nullable: true })
    resolucion: string | null;

    @Column({ type: 'varchar', nullable: true })
    demandante: string | null;

    @Column({ type: 'varchar', nullable: true })
    descripcion: string | null;

    // The frontend defines the administrative document type.
    @Column({ type: 'varchar', nullable: true })
    tipo: string | null;
}
