import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Consumer } from './consumer.entity';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { Users } from 'src/user/users.entity';
import { UsersModule } from 'src/user/users.module';

import { Business } from './types/business/business.entity';
import { Individual } from './types/individual/individual.entity';
import { LawFirm } from './types/law_firm/law-firm.entity';
import { Procurator } from './types/procurator/procurator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consumer,
      Users,
      Business,
      Individual,
      Procurator,
      LawFirm,
    ]),
    UsersModule,
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}