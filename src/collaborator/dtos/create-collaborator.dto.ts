import { ApiProperty } from "@nestjs/swagger";

export class CreateCollaboratorDto {
    @ApiProperty()
    names: string;

    @ApiProperty()
    lastnames: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;
}