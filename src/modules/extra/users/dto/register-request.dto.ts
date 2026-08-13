import { UserRole } from "src/modules/extra/users/enum/users-role.enum";
import {ApiProperty} from "@nestjs/swagger";

export class RegisterRequestDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    role: UserRole;
}