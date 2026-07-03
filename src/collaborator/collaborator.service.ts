import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collaborator } from './collaborator.entity';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from 'src/user/users.entity';
import { CreateCollaboratorDto } from './dtos/create-collaborator.dto';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class CollaboratorService {
    constructor(
        @InjectRepository(Collaborator)
        private readonly collaboratorRepository: Repository<Collaborator>,

        private readonly UsersService: UsersService,

        private readonly dataSource: DataSource


    ) {}

    async createCollaborator(dto: CreateCollaboratorDto): Promise<Collaborator> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.UsersService.registerUser(
                {
                    email: dto.email,
                    password: dto.password,
                    role: UserRole.COLLABORATOR,
                },
                manager,
            );

            const collaborator = manager.create(Collaborator, {
                names: dto.names,
                lastnames: dto.lastnames,
                user,
            });
            return await manager.save(collaborator);
        });
    }


}