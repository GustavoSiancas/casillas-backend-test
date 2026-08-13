import { ApiProperty } from "@nestjs/swagger";
import { ProcuratorDocumentType } from "src/modules/mailbox/procurator/procurator.entity";

export class CreateProcuratorDto{
    @ApiProperty()
    names: string;

    @ApiProperty()
    last_names: string;

    @ApiProperty({
        enum: ProcuratorDocumentType
    })
    document_type: ProcuratorDocumentType;

    @ApiProperty()
    document_number: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    email: string;
}
