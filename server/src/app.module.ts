import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PaymentsModule } from "./stripe/payments.module";
import { ChatModule } from "./chat/chat.module";

import { User } from "./users/user.entity";
import { Product } from "./products/product.entity";
import { Order } from "./orders/order.entity";
import { Chat } from "./chat/chat.entity";

@Module({
  imports: [
    // Load .env globally for entire app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database connection
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "nest_ecom",
      entities: [User, Product, Order, Chat],
      synchronize: true,
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    NotificationsModule,
    PaymentsModule,
    ChatModule,
  ],
})
export class AppModule {}
