import { Collaborator } from 'src/collaborator/collaborator.entity';
import { Entity, 
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToOne
} from 'typeorm';

export enum UserRole {
    COLLABORATOR='COLLABORATOR',
    LAWYER='LAWYER'
}

@Entity('users')
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column(
        {
            type: 'enum',
            enum: UserRole
        }
    )
    role: UserRole;

    //relations One to One
    @OneToOne(() => Collaborator, collaborator => collaborator.user)
    collaborator: Collaborator;

    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}