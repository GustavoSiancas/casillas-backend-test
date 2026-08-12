import { ApiProperty } from '@nestjs/swagger';
import { Consumer } from '../../consumer.entity';
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
            dni: consumer.individual.dni,
            full_name: consumer.individual.full_name,
            cal_number: consumer.individual.cal_number,
        };
    }
}
