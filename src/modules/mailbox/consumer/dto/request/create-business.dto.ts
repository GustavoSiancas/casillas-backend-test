import { ApiProperty } from "@nestjs/swagger";
import { ConsumerType } from "src/modules/mailbox/consumer/enum/consumer-type.enum";

export class CreateBusinessDto {

    @ApiProperty()
    consumerType: ConsumerType;

    @ApiProperty()
    email: string;
    
    @ApiProperty()
    ruc: string;

    @ApiProperty()
    social_reason: string;

    @ApiProperty()
    legal_representative: string;

    @ApiProperty()
    legal_adress: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    principal_phone: string;
}