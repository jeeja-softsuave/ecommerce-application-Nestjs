import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { Chat } from "./chat.entity";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    UsersModule,
    AuthModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}

