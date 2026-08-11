import { ApiProperty } from "@nestjs/swagger";
import { ConsumerType } from "../../consumer.entity";

export class CreateLawFirmDto {
    @ApiProperty()
    names: string;

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