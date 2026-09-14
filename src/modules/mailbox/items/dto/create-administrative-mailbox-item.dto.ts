import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAdministrativeMailboxItemDto {
    @ApiProperty({ minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    mailboxConsumerId: number;

    @ApiProperty({ description: 'Fecha propia de la notificación.' })
    @IsDateString()
    fecha: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nroExpediente?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    resolucion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    juzgado?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    materia?: string;

    @ApiPropertyOptional({ description: 'Tipo definido por el frontend.' })
    @IsOptional()
    @IsString()
    tipo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    demandante?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    demandado?: string;
}
