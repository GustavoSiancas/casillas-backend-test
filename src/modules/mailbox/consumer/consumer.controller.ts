import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    NotFoundException,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiExtraModels,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiParam,
    ApiQuery,
    getSchemaPath,
} from '@nestjs/swagger';
import { ConsumerService } from './consumer.service';
import { UserResponse } from '../../extra/users/dto/user.response';
import { CreateIndividualDto } from './dto/request/create-individual.dto';
import { CreateLawFirmDto } from './dto/request/create-law-firm.dto';
import { CreateBusinessDto } from './dto/request/create-business.dto';
import { IndividualConsumerResponse } from './dto/response/individual-consumer.response';
import { BusinessConsumerResponse } from './dto/response/business-consumer.response';
import { LawFirmConsumerResponse } from './dto/response/law-firm-consumer.response';
import { ConsumerType } from './enum/consumer-type.enum';
import {
    ConsumerDetailResponse,
    consumerResponseByType,
} from './dto/response/consumer-detail.response';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { ConsumerBaseResponse } from './dto/response/consumer-base.response';

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
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'numberID', required: false, type: String })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'consumerType', required: false, enum: ConsumerType })
    async getAllConsumers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('numberID') numberID?: string,
        @Query('name') name?: string,
        @Query(
            'consumerType',
            new ParseEnumPipe(ConsumerType, { optional: true }),
        )
        consumerType?: ConsumerType,
    ): Promise<PaginatedResponse<ConsumerBaseResponse>> {
        const normalizedPage = Math.max(page, 1);
        const normalizedLimit = Math.min(Math.max(limit, 1), 100);
        const result = await this.consumerService.getAllConsumers(
            normalizedPage,
            normalizedLimit,
            numberID,
            name,
            consumerType,
        );

        return new PaginatedResponse(
            result.data.map((consumer) =>
                ConsumerBaseResponse.fromEntity(consumer),
            ),
            result.pagination,
        );
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

    @Get(':id')
    @ApiOkResponse({
        description: 'Consumidor con la información correspondiente a su tipo',
        schema: {
            oneOf: [
                { $ref: getSchemaPath(IndividualConsumerResponse) },
                { $ref: getSchemaPath(BusinessConsumerResponse) },
                { $ref: getSchemaPath(LawFirmConsumerResponse) },
            ],
        },
    })
    @ApiNotFoundResponse({ description: 'Consumidor no encontrado' })
    async getConsumerById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ConsumerDetailResponse> {
        const consumer = await this.consumerService.getConsumerById(id);
        return consumerResponseByType[consumer.consumerType].fromEntity(
            consumer,
        );
    }
}
