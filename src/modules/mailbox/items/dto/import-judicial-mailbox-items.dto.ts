import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum } from 'class-validator';
import { MailboxSite } from '../../mailboxes/enum/mailbox.enum';
import { JudicialMailboxItemInstitution } from '../entites/judicial-mailbox-item-data.entity';

export class ImportJudicialMailboxItemsDto {
    @ApiProperty({ enum: MailboxSite })
    @IsEnum(MailboxSite)
    sede: MailboxSite;

    @ApiProperty({ enum: JudicialMailboxItemInstitution })
    @IsEnum(JudicialMailboxItemInstitution)
    tipo: JudicialMailboxItemInstitution;

    @ApiProperty({ description: 'Fecha de visibilidad de los items importados.' })
    @IsDateString()
    fecha: string;
}
