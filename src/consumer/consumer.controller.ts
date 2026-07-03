import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { CreateConsumerDto } from './dtos/create-consumer.dto';
import { Consumer } from './consumer.entity';

@Controller('consumer')
export class ConsumerController {
    constructor(
        private readonly consumerService: ConsumerService,
    ) {}

    @Post('create')
    async createConsumer(
        @Body() dto: CreateConsumerDto,
    ): Promise<Consumer> {
        return this.consumerService.createConsumer(dto);
    }

    @Get('all')
    async getAllConsumers(): Promise<Consumer[]> {
        return this.consumerService.getAllConsumers();
    }
}