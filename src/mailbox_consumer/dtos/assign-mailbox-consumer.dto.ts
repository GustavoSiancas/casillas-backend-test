import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AssignMailboxConsumerDto {
    @ApiProperty()
    @IsInt()
    @IsPositive()
    consumerId: number;
}
