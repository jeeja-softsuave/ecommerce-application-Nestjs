import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./order.entity";
import { ProductsService } from "../products/products.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    private productsSvc: ProductsService,
    private notifications: NotificationsService
  ) {}

  async purchase(
    userId: number,
    items: { productId: number; name: string; qty: number }[],
    userEmail?: string,
    userPhone?: string
  ) {
    if (!items || items.length === 0)
      throw new NotFoundException("No items provided");

    let total = 0;

    // Validate products and calculate total
    for (const item of items) {
      const product = await this.productsSvc.findById(item.productId);
      if (!product)
        throw new NotFoundException(`Product ${item.productId} not found`);
      total += product.price * item.qty;
    }

    // Save order with all items
    const order = this.repo.create({
      user: { id: userId },
      items,
      totalAmount: total,
      status: "confirmed",
    });
    const saved = await this.repo.save(order);

    // Notifications (async)
    try {
      const itemSummary = items.map((i) => `${i.name} x${i.qty}`).join(", ");
      if (userEmail)
        await this.notifications.sendEmail(
          userEmail,
          "Order confirmation",
          `You purchased: ${itemSummary}. Total: ₹${total}`
        );
      if (userPhone)
        await this.notifications.sendSms(
          userPhone,
          `Order confirmed: ${itemSummary}. Total: ₹${total}`
        );
    } catch (err) {
      console.error("Notification error", err);
    }

    return saved;
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
