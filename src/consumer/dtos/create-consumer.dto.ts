import { ApiProperty } from "@nestjs/swagger";
import { ConsumerType } from "../consumer.entity";

export class CreateConsumerDto {
    @ApiProperty()
    names: string;

    @ApiProperty()
    consumerType: ConsumerType;

    @ApiProperty()
    userId: number;
}