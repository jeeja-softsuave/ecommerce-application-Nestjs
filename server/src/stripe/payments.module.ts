import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PaymentsService } from "./payment.service";
import { PaymentsController } from "./payment.controller";

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
