import { ApiProperty } from "@nestjs/swagger";

export class CreateMailboxItemDto {
    @ApiProperty()
    title: string;
    
    @ApiProperty()
    description: string;

    @ApiProperty()
    mailboxId: number;
}