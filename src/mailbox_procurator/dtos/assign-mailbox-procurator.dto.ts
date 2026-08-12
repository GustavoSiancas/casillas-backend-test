import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AssignMailboxProcuratorDto {
    @ApiProperty()
    @IsInt()
    @IsPositive()
    procuratorId: number;
}
