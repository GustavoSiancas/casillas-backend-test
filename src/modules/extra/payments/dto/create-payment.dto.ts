import { IsInt, IsPositive, IsString, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsPositive()
  mailboxId: number;

  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount debe ser un número decimal válido con hasta 2 decimales.',
  })
  amount: string;
}