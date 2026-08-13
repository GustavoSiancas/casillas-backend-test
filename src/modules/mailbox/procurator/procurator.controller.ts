import { Body, Controller, Post } from "@nestjs/common";
import { ProcuratorService } from "./procurator.service";
import { Procurator } from "./procurator.entity";
import { CreateProcuratorDto } from "src/modules/mailbox/consumer/dto/request/create-procurator.dto";


@Controller("procurator")
export class ProcuratorController {
  constructor(
    private readonly procuratorService: ProcuratorService
  ) {}

  @Post('create')
  async createProcurator(
    @Body() dto: CreateProcuratorDto,
  ): Promise<Procurator> {
    return this.procuratorService.createProcurator(dto);
  }
}