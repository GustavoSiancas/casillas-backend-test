import { ApiProperty } from '@nestjs/swagger';
import { Consumer } from '../../entities/consumer.entity';
import { ConsumerBaseResponse } from './consumer-base.response';

export class IndividualConsumerResponse extends ConsumerBaseResponse {
    @ApiProperty()
    dni: string;

    @ApiProperty()
    full_name: string;

    @ApiProperty()
    cal_number: string;

    static fromEntity(consumer: Consumer): IndividualConsumerResponse {
        return {
            ...this.getBaseData(consumer),
            dni: consumer.numberID,
            full_name: consumer.name,
            cal_number: consumer.individual.cal_number,
        };
    }
}
