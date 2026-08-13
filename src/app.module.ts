import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/extra/users/users.module';
import { CollaboratorModule } from './modules/extra/collaborator/collaborator.module';
import { ConsumerModule } from './modules/mailbox/consumer/consumer.module';
import { PaymentsModule } from './modules/extra/payments/payment.module';
import { MailboxModule } from './mailbox/mailbox.module';
import { MailboxItemModule } from './modules/mailbox/items/item.module';
import { ProcuratorModule } from './modules/mailbox/procurator/procurator.module';
import { MailboxConsumerModule } from './mailbox_consumer/mailbox-consumer.module';
import { MailboxProcuratorModule } from './mailbox_procurator/mailbox-procurator.module';

@Module({
  
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
    }),
    ConsumerModule,
    UsersModule,
    CollaboratorModule,
    PaymentsModule,
    MailboxModule,
    MailboxItemModule,
    ProcuratorModule,
    MailboxConsumerModule,
    MailboxProcuratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
