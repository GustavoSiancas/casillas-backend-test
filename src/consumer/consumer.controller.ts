import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { Consumer } from './consumer.entity';
import { UserResponse } from './dtos/response/user.response';
import { CreateIndividualDto } from './dtos/request/create-individual.dto';
import { CreateLawFirmDto } from './dtos/request/create-law-firm.dto';
import { CreateBusinessDto } from './dtos/request/create-business.dto';

@Controller('consumer')
export class ConsumerController {
    constructor(
        private readonly consumerService: ConsumerService,
    ) {}

    @Post('create-individual')
    async createIndividualConsumer(
        @Body() dto: CreateIndividualDto,
    ): Promise<UserResponse> {
        return this.consumerService.createIndividualConsumer(dto);
    }

    @Post('create-business')
    async createBusinessConsumer(
        @Body() dto: CreateBusinessDto,
    ): Promise<UserResponse> {
        return this.consumerService.createBusinessConsumer(dto);
    }

    @Post('create-law-firm')
    async createLawFirmConsumer(
        @Body() dto: CreateLawFirmDto,
    ): Promise<UserResponse> {
        return this.consumerService.createLawFirmConsumer(dto);
    }

    @Get('all')
    async getAllConsumers(): Promise<Consumer[]> {
        return this.consumerService.getAllConsumers();
    }
}