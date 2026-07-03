import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Consumer } from './consumer.entity';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { Users } from 'src/user/users.entity';
import { UsersModule } from 'src/user/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consumer,
      Users,
    ]),
    UsersModule,
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}