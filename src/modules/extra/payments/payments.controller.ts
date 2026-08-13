import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { Payments } from "./payments.entity";

@Controller("payments")
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPayment(
        @Body() dto: CreatePaymentDto,
    ): Promise<Payments> {
        return await this.paymentsService.createPayment(dto);
    }
}