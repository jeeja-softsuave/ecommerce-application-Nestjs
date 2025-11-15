import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createPaymentIntent(amount: number) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // IMPORTANT: Stripe uses cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret, // must return this!
    };
  }
}
