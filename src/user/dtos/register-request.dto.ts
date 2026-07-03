import { UserRole } from "../users.entity";
import {ApiProperty} from "@nestjs/swagger";

export class RegisterRequestDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    role: UserRole;
}