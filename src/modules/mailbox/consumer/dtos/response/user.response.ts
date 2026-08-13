import { ApiProperty } from "@nestjs/swagger";


export class UserResponse {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;
}