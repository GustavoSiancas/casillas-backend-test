import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseEnumPipe,
    Post,
} from '@nestjs/common';
import {
    ApiExtraModels,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiParam,
    getSchemaPath,
} from '@nestjs/swagger';
import { ConsumerService } from './consumer.service';
import { Consumer, ConsumerType } from './entities/consumer.entity';
import { UserResponse } from './dtos/response/user.response';
import { CreateIndividualDto } from './dtos/request/create-individual.dto';
import { CreateLawFirmDto } from './dtos/request/create-law-firm.dto';
import { CreateBusinessDto } from './dtos/request/create-business.dto';
import { IndividualConsumerResponse } from './dtos/response/individual-consumer.response';
import { BusinessConsumerResponse } from './dtos/response/business-consumer.response';
import { LawFirmConsumerResponse } from './dtos/response/law-firm-consumer.response';
import {
    ConsumerDetailResponse,
    consumerResponseByType,
} from './dtos/response/consumer-detail.response';

@ApiExtraModels(
    IndividualConsumerResponse,
    BusinessConsumerResponse,
    LawFirmConsumerResponse,
)
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

    @Get('unique/:consumerType/:data')
    @ApiParam({
        name: 'consumerType',
        enum: ConsumerType,
        description: 'Tipo de consumidor',
    })
    @ApiParam({
        name: 'data',
        description: 'DNI para una persona o RUC para una empresa/estudio jurídico',
    })
    @ApiOkResponse({
        description: 'Consumidor encontrado',
        schema: {
            oneOf: [
                { $ref: getSchemaPath(IndividualConsumerResponse) },
                { $ref: getSchemaPath(BusinessConsumerResponse) },
                { $ref: getSchemaPath(LawFirmConsumerResponse) },
            ],
        },
    })
    @ApiNotFoundResponse({ description: 'Consumidor no encontrado' })
    async getConsumerWithDataUnique(
        @Param('data') data: string,
        @Param('consumerType', new ParseEnumPipe(ConsumerType))
        consumerType: ConsumerType,
    ): Promise<ConsumerDetailResponse> {
        const consumer = await this.consumerService.getConsumerWithDataUnique(
            data,
            consumerType,
        );

        if (!consumer) {
            throw new NotFoundException('Consumidor no encontrado');
        }

        return consumerResponseByType[consumerType].fromEntity(consumer);
    }
}
