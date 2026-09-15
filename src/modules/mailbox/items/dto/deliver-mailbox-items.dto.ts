import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { MailboxItemDeliverableType } from '../entites/mailbox-item-deliverable-group.entity';

export class DeliverMailboxItemsDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    @Min(1, { each: true })
    mailboxItemIds: number[];

    @Type(() => Number)
    @IsInt()
    @Min(1)
    collaboratorId: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    procuratorId?: number;

    @IsOptional()
    @IsEnum(MailboxItemDeliverableType)
    deliverableType?: MailboxItemDeliverableType;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    receiptImageUrl?: string;
}
