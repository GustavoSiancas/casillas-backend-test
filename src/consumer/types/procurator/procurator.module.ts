import { Module } from "@nestjs/common";
import { Procurator } from "./procurator.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcuratorController } from "./procurator.controller";
import { ProcuratorService } from "./procurator.service";
import { Consumer } from "src/consumer/consumer.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Procurator,
      Consumer,
    ])
  ],
  controllers: [ProcuratorController],
  providers: [ProcuratorService],
  exports: [],
})
export class ProcuratorModule {}