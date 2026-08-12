import { ApiProperty } from '@nestjs/swagger';
import { Consumer } from '../../consumer.entity';
import { ConsumerBaseResponse } from './consumer-base.response';

export class BusinessConsumerResponse extends ConsumerBaseResponse {
    @ApiProperty()
    ruc: string;

    @ApiProperty()
    social_reason: string;

    static fromEntity(consumer: Consumer): BusinessConsumerResponse {
        return {
            ...this.getBaseData(consumer),
            ruc: consumer.business.ruc,
            social_reason: consumer.business.social_reason,
        };
    }
}
