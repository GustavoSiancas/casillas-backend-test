import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collaborator } from './collaborator.entity';
import { CollaboratorController } from './collaborator.controller';
import { CollaboratorService } from './collaborator.service';
import { Users } from 'src/modules/extra/users/users.entity';
import { UsersModule } from 'src/modules/extra/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collaborator,
      Users,
    ]),
    UsersModule,  
  ],
  controllers: [CollaboratorController],
  providers: [CollaboratorService],
  exports: [CollaboratorService],
})
export class CollaboratorModule {}