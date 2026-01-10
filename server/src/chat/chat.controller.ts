import {
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { GetUser } from "../auth/get-user.decorator";

/**
 * REST API Controller for chat-related endpoints
 * Provides endpoints to fetch admins, message history, etc.
 */
@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
    private usersService: UsersService
  ) {}

  /**
   * Get all admin users for user selection
   */
  @Get("admins")
  async getAdmins() {
    const admins = await this.usersService.findAllAdmins();
    return admins.map((admin) => ({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    }));
  }

  /**
   * Get all users for admin selection (when admin wants to chat with users)
   */
  @Get("users")
  async getUsers(@GetUser() user: { id: number; role: string }) {
    // Only admins can get list of users
    if (user.role !== "admin") {
      return [];
    }
    const users = await this.usersService.findAllUsers();
    return users
      .filter((u) => u.id !== user.id) // Exclude current admin
      .map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
      }));
  }

  /**
   * Get message history for a specific room
   */
  @Get("history/:roomId")
  async getMessageHistory(@Param("roomId") roomId: string) {
    return this.chatService.getMessageHistory(roomId);
  }

  /**
   * Get all rooms for the current user
   */
  @Get("rooms")
  async getUserRooms(@GetUser() user: { id: number; role: string }) {
    return this.chatService.getUserRooms(user.id, user.role);
  }

  /**
   * Upload a file for chat
   */
  @Post("upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/chat",
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { roomId: string; message?: string },
    @GetUser() user: { id: number; role: string }
  ) {
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Save message with file info
    const chatMessage = await this.chatService.saveMessage(
      body.roomId,
      user.id,
      user.role,
      body.message || "",
      file.originalname,
      `chat/${file.filename}`,
      file.mimetype,
      file.size
    );

    // Broadcast file message via WebSocket
    this.chatGateway.broadcastMessage({
      id: chatMessage.id,
      roomId: chatMessage.roomId,
      senderId: chatMessage.senderId,
      senderRole: chatMessage.senderRole,
      message: chatMessage.message,
      fileName: chatMessage.fileName,
      filePath: chatMessage.filePath,
      fileType: chatMessage.fileType,
      fileSize: chatMessage.fileSize,
      createdAt: chatMessage.createdAt,
    });

    return {
      success: true,
      message: chatMessage,
      fileUrl: `/uploads/chat/${file.filename}`,
    };
  }
}

