import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ProcuratorService } from "./procurator.service";
import { Procurator } from "./procurator.entity";
import { CreateProcuratorDto } from "src/modules/mailbox/consumer/dto/request/create-procurator.dto";


@Controller('consumers/:consumerId/procurators')
export class ProcuratorController {
  constructor(
    private readonly procuratorService: ProcuratorService
  ) {}

  @Post()
  async addProcuratorToConsumer(
    @Param('consumerId', ParseIntPipe) consumerId: number,
    @Body() dto: CreateProcuratorDto,
  ): Promise<Procurator> {
    return this.procuratorService.addProcuratorToConsumer(consumerId, dto);
  }

  @Get()
  getProcuratorsByConsumer(
    @Param('consumerId', ParseIntPipe) consumerId: number,
  ): Promise<Procurator[]> {
    return this.procuratorService.getProcuratorsByConsumer(consumerId);
  }
}
