import { ApiProperty } from '@nestjs/swagger';
import { Consumer } from '../../entities/consumer.entity';
import { ConsumerBaseResponse } from './consumer-base.response';

export class LawFirmConsumerResponse extends ConsumerBaseResponse {
    @ApiProperty()
    ruc: string;

    @ApiProperty()
    firm_name: string;

    static fromEntity(consumer: Consumer): LawFirmConsumerResponse {
        return {
            ...this.getBaseData(consumer),
            ruc: consumer.lawFirm.ruc,
            firm_name: consumer.lawFirm.firm_name,
        };
    }
}
