import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "./chat.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>
  ) {}

  /**
   * Save a message to the database
   */
  async saveMessage(
    roomId: string,
    senderId: number,
    senderRole: string,
    message: string,
    fileName?: string,
    filePath?: string,
    fileType?: string,
    fileSize?: number
  ): Promise<Chat> {
    const chat = this.chatRepo.create({
      roomId,
      senderId,
      senderRole,
      message,
      fileName,
      filePath,
      fileType,
      fileSize,
    });
    return this.chatRepo.save(chat);
  }

  /**
   * Get message history for a specific room
   */
  async getMessageHistory(roomId: string): Promise<Chat[]> {
    return this.chatRepo.find({
      where: { roomId },
      order: { createdAt: "ASC" },
    });
  }

  /**
   * Get all rooms for a user (either as user or admin)
   */
  async getUserRooms(userId: number, role: string): Promise<string[]> {
    const chats = await this.chatRepo
      .createQueryBuilder("chat")
      .where("chat.senderId = :userId", { userId })
      .orWhere("chat.roomId LIKE :pattern", {
        pattern: role === "admin" ? `chat:%:${userId}` : `chat:${userId}:%`,
      })
      .select("DISTINCT chat.roomId", "roomId")
      .getRawMany();

    return chats.map((c) => c.roomId);
  }
}

