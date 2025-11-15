import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payment.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    return await this.paymentService.createPaymentIntent(body.amount);
  }
}
