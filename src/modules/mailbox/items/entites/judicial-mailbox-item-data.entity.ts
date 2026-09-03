import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MailboxItem } from './mailbox-item.entity';

export enum JudicialMailboxItemInstitution {
    SERNOT = 'SERNOT',
    SUPREMAS = 'SUPREMAS',
}

@Entity('judicial_mailbox_item_data')
export class JudicialMailboxItemData {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => MailboxItem, item => item.judicialData, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'mailbox_item_id' })
    mailboxItem: MailboxItem;

    @Column({
        name: 'institution',
        type: 'enum',
        enum: JudicialMailboxItemInstitution,
    })
    institution: JudicialMailboxItemInstitution;

    @Column({ type: 'text', nullable: true })
    direccion: string | null;

    @Column({ type: 'varchar', nullable: true })
    x_desc_ubigeo: string | null;

    @Column({ type: 'text', nullable: true })
    observa: string | null;

    @Column({ type: 'varchar', nullable: true })
    orden: string | null;

    @Column({ type: 'varchar', nullable: true })
    codcli: string | null;

    @Column({ type: 'varchar', nullable: true })
    u_nomb_abo: string | null;

    @Column({ type: 'varchar', nullable: true })
    u_nro_cole: string | null;

    @Column({ type: 'varchar', nullable: true })
    u_nomb_lit: string | null;

    @Column({ type: 'varchar', nullable: true })
    u_le_litg: string | null;

    @Column({ type: 'varchar', nullable: true })
    u_nro_expe: string | null;

    @Column({ type: 'varchar', nullable: true })
    u_fecha: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_nro_expe: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_dependen: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_sede: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_demandan: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_demandad: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_materia: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_cuaderno: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_resoluci: string | null;

    @Column({ type: 'varchar', nullable: true })
    s_notifica: string | null;

    @Column({ type: 'varchar', nullable: true })
    fecha: string | null;

    @Column({ type: 'varchar', nullable: true })
    hora: string | null;

    @Column({ type: 'varchar', nullable: true })
    nro_cuenta: string | null;

    @Column({ type: 'varchar', nullable: true })
    descar: string | null;

    @Column({ type: 'varchar', nullable: true })
    ingreso: string | null;

    @Column({ type: 'varchar', nullable: true })
    nuevo: string | null;

    @Column({ type: 'varchar', nullable: true })
    cod_mensa: string | null;

    @Column({ type: 'varchar', nullable: true })
    fecha_sal: string | null;

    @Column({ type: 'varchar', nullable: true })
    f_descargo: string | null;

    @Column({ type: 'text', nullable: true })
    nueva_dir: string | null;

    @Column({ type: 'varchar', nullable: true })
    telefono: string | null;

    @Column({ type: 'varchar', nullable: true })
    fecha_des: string | null;

    @Column({ type: 'varchar', nullable: true })
    hora_des: string | null;

    @Column({ type: 'varchar', nullable: true })
    hora_entre: string | null;

    @Column({ type: 'varchar', nullable: true })
    fecha_entr: string | null;

    @Column({ type: 'varchar', nullable: true })
    clasifica: string | null;

    @Column({ type: 'varchar', nullable: true })
    fecha_cla: string | null;

    @Column({ type: 'varchar', nullable: true })
    hora_cla: string | null;

    @Column({ type: 'varchar', nullable: true })
    chequeo: string | null;

    @Column({ type: 'varchar', nullable: true })
    ind_estado: string | null;

    @Column({ type: 'varchar', nullable: true })
    cod_emp_descargo: string | null;
}
