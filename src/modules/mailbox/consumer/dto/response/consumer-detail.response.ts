import { ConsumerType } from '../../entities/consumer.entity';
import { BusinessConsumerResponse } from './business-consumer.response';
import { IndividualConsumerResponse } from './individual-consumer.response';
import { LawFirmConsumerResponse } from './law-firm-consumer.response';

export type ConsumerDetailResponse =
    | IndividualConsumerResponse
    | BusinessConsumerResponse
    | LawFirmConsumerResponse;

export const consumerResponseByType = {
    [ConsumerType.INDIVIDUAL]: IndividualConsumerResponse,
    [ConsumerType.BUSINESS]: BusinessConsumerResponse,
    [ConsumerType.LAW_FIRM]: LawFirmConsumerResponse,
};
