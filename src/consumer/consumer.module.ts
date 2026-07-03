import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Consumer } from './consumer.entity';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { Users } from 'src/user/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consumer,
      Users,
    ]),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}