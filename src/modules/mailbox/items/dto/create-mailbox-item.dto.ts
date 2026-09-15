import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MailboxItemType } from '../entites/mailbox-item.entity';

export class CreateMailboxItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    caseNumber: string;

    @ApiProperty({ enum: MailboxItemType })
    @IsEnum(MailboxItemType)
    type: MailboxItemType;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;
}
