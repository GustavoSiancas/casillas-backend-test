import { ConsumerType } from 'src/modules/mailbox/consumer/enum/consumer-type.enum';
import { ConsumerDetailResponse } from 'src/modules/mailbox/consumer/dto/response/consumer-detail.response';
import { Users } from '../users.entity';

export type LoginResponse = Omit<Users, 'consumer'> & {
    consumerType: ConsumerType | null;
    consumerId: number | null;
    consumer: ConsumerDetailResponse | null;
};
