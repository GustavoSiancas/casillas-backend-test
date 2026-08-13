import { ApiProperty } from "@nestjs/swagger";
import { ConsumerType } from "../../entities/consumer.entity";

export class CreateLawFirmDto {


    @ApiProperty()
    consumerType: ConsumerType;

    @ApiProperty()
    email: string;
    
    @ApiProperty()
    ruc: string;

    @ApiProperty()
    firm_name: string;

    @ApiProperty()
    legal_representative: string;

    @ApiProperty()
    legal_adress: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    principal_phone: string;
}