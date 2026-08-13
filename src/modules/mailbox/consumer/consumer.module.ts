import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Consumer } from './entities/consumer.entity';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { Users } from 'src/modules/extra/users/users.entity';
import { UsersModule } from 'src/modules/extra/users/users.module';

import { Business } from './entities/business.entity';
import { Individual } from './entities/individual.entity';
import { LawFirm } from './entities/law-firm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consumer,
      Users,
      Business,
      Individual,
      LawFirm,
    ]),
    UsersModule,
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
