import { Module } from "@nestjs/common";
import { Procurator } from "./procurator.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcuratorController } from "./procurator.controller";
import { ProcuratorService } from "./procurator.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Procurator,
    ])
  ],
  controllers: [ProcuratorController],
  providers: [ProcuratorService],
  exports: [],
})
export class ProcuratorModule {}
