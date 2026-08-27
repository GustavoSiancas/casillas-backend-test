import { ApiProperty } from '@nestjs/swagger';
import { Consumer } from '../../entities/consumer.entity';
import { ConsumerBaseResponse } from './consumer-base.response';

export class BusinessConsumerResponse extends ConsumerBaseResponse {
    @ApiProperty()
    ruc: string;

    @ApiProperty()
    social_reason: string;

    static fromEntity(consumer: Consumer): BusinessConsumerResponse {
        return {
            ...this.getBaseData(consumer),
            ruc: consumer.numberID,
            social_reason: consumer.name,
        };
    }
}
