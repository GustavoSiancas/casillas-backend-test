import { UserRole } from "../users.entity";

export class RegisterRequestDto {
    email: string;
    password: string;
    role: UserRole;
}