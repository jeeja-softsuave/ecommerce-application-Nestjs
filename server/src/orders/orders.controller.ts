import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: any,
    @Body() body: { items: { productId: number; name: string; qty: number }[] },
  ) {
    const user = req.user;
    return this.svc.purchase(
      user.id,
      body.items,
      user.email,
      user.phone,
    );
  }
}
