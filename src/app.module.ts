import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/extra/users/users.module';
import { CollaboratorModule } from './modules/extra/collaborator/collaborator.module';
import { ConsumerModule } from './modules/mailbox/consumer/consumer.module';
import { MailboxModule } from './modules/mailbox/mailboxes/mailbox.module';
import { MailboxItemModule } from './modules/mailbox/items/item.module';
import { ProcuratorModule } from './modules/mailbox/procurator/procurator.module';
import { AssignmentsModule } from './modules/mailbox/assignments/assignments.module';

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
    MailboxModule,
    MailboxItemModule,
    ProcuratorModule,
    AssignmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
