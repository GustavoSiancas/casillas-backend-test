import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collaborator } from './collaborator.entity';
import { Repository } from 'typeorm';
import { UserRole, Users } from 'src/user/users.entity';
import { CreateCollaboratorDto } from './dtos/create-collaborator.dto';

@Injectable()
export class CollaboratorService {
    constructor(
        @InjectRepository(Collaborator)
        private readonly collaboratorRepository: Repository<Collaborator>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
    ) {}

    async createCollaborator(dto: CreateCollaboratorDto): Promise<Collaborator> {
        const user = await this.usersRepository.findOne({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${dto.userId} not found`);
        }

        if (user.role === UserRole.COLLABORATOR){
            const collaborator = this.collaboratorRepository.create({
                names: dto.names,
                lastnames: dto.lastnames,
                user: user,
            });
            return await this.collaboratorRepository.save(collaborator);

        } else {
            throw new NotFoundException(`User with ID ${dto.userId} is not a collaborator`);
        }

    }


}