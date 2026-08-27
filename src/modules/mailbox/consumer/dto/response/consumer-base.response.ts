import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Consumer } from '../../entities/consumer.entity';
import { ConsumerType } from '../../enum/consumer-type.enum';

export class ConsumerBaseResponse {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: ConsumerType })
    consumerType: ConsumerType;

    @ApiProperty({ description: 'DNI o RUC del consumidor' })
    numberID: string;

    @ApiProperty({ description: 'Nombre completo o razón social' })
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    principal_phone: string;

    @ApiProperty()
    legal_adress: string;

    @ApiPropertyOptional({ nullable: true })
    legal_representative: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    protected static getBaseData(consumer: Consumer): ConsumerBaseResponse {
        return {
            id: consumer.id,
            consumerType: consumer.consumerType,
            numberID: consumer.numberID,
            name: consumer.name,
            email: consumer.email,
            phone: consumer.phone,
            principal_phone: consumer.principal_phone,
            legal_adress: consumer.legal_adress,
            legal_representative: consumer.legal_representative,
            createdAt: consumer.createdAt,
            updatedAt: consumer.updatedAt,
        };
    }

    static fromEntity(consumer: Consumer): ConsumerBaseResponse {
        return ConsumerBaseResponse.getBaseData(consumer);
    }
}
