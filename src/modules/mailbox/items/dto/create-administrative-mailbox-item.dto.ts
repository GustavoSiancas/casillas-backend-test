import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateAdministrativeMailboxItemDto {
    @ApiProperty({ minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    mailboxConsumerId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    caseNumber: string;

    @ApiProperty({ description: 'Fecha propia de la notificación.' })
    @IsDateString()
    documentDate: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    juzgado?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    materia?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    resolucion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    demandante?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({ description: 'Tipo definido por el frontend.' })
    @IsOptional()
    @IsString()
    tipo?: string;
}
