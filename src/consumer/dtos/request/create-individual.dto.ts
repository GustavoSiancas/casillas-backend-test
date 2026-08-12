import { ApiProperty } from "@nestjs/swagger";
import { ConsumerType } from "../../consumer.entity";

export class CreateIndividualDto {

    @ApiProperty()
    consumerType: ConsumerType;

    @ApiProperty()
    email: string;
    
    @ApiProperty()
    dni: string;

    @ApiProperty()
    full_name: string;

    @ApiProperty()
    cal_number: string;

    @ApiProperty()
    legal_representative: string;

    @ApiProperty()
    legal_adress: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    principal_phone: string;
}