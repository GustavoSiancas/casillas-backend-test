import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Consumer, ConsumerType } from '../../consumer.entity';

export class ConsumerBaseResponse {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: ConsumerType })
    consumerType: ConsumerType;

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
            email: consumer.email,
            phone: consumer.phone,
            principal_phone: consumer.principal_phone,
            legal_adress: consumer.legal_adress,
            legal_representative: consumer.legal_representative,
            createdAt: consumer.createdAt,
            updatedAt: consumer.updatedAt,
        };
    }
}
