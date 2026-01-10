import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { Logger, UnauthorizedException } from "@nestjs/common";

/**
 * WebSocket Gateway for real-time chat
 * Handles room-based messaging between users and admins
 * Room format: chat:userId:adminId
 */
@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
  namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, { userId: number; role: string }>();
  private typingUsers = new Map<string, Set<number>>(); // roomId -> Set of userIds typing

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  /**
   * Handle client connection
   * Authenticate user via JWT token
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || "secretKey",
      });

      // Get user details
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`Connection rejected: User not found`);
        client.disconnect();
        return;
      }

      // Store user connection info
      this.connectedUsers.set(client.id, {
        userId: user.id,
        role: user.role,
      });

      // Store user info in socket data
      client.data.userId = user.id;
      client.data.role = user.role;

      this.logger.log(
        `User connected: ${user.email} (${user.role}) - Socket ID: ${client.id}`
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      this.logger.log(
        `User disconnected: ${userInfo.userId} (${userInfo.role})`
      );
      this.connectedUsers.delete(client.id);
    }
  }

  /**
   * Join a chat room
   * Room format: chat:userId:adminId
   */
  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const userId = client.data.userId;
    const role = client.data.role;

    if (!userId || !role) {
      return { error: "Unauthorized" };
    }

    // Validate room format: chat:userId:adminId
    const roomParts = data.roomId.split(":");
    if (roomParts.length !== 3 || roomParts[0] !== "chat") {
      return { error: "Invalid room format" };
    }

    const roomUserId = parseInt(roomParts[1]);
    const roomAdminId = parseInt(roomParts[2]);

    // Verify user has access to this room
    if (role === "user" && userId !== roomUserId) {
      return { error: "Access denied" };
    }
    if (role === "admin" && userId !== roomAdminId) {
      return { error: "Access denied" };
    }

    // Join the room
    await client.join(data.roomId);
    this.logger.log(`User ${userId} (${role}) joined room: ${data.roomId}`);

    // Send message history
    const history = await this.chatService.getMessageHistory(data.roomId);
    client.emit("messageHistory", history);

    return { success: true, roomId: data.roomId };
  }

  /**
   * Leave a chat room
   */
  @SubscribeMessage("leaveRoom")
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    await client.leave(data.roomId);
    this.logger.log(`User ${client.data.userId} left room: ${data.roomId}`);
    return { success: true };
  }

  /**
   * Send a message in a room
   */
  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      fileName?: string;
      filePath?: string;
      fileType?: string;
      fileSize?: number;
    }
  ) {
    const userId = client.data.userId;
    const role = client.data.role;

    if (!userId || !role) {
      return { error: "Unauthorized" };
    }

    // Validate room format
    const roomParts = data.roomId.split(":");
    if (roomParts.length !== 3 || roomParts[0] !== "chat") {
      return { error: "Invalid room format" };
    }

    const roomUserId = parseInt(roomParts[1]);
    const roomAdminId = parseInt(roomParts[2]);

    // Verify user has access to this room
    if (role === "user" && userId !== roomUserId) {
      return { error: "Access denied" };
    }
    if (role === "admin" && userId !== roomAdminId) {
      return { error: "Access denied" };
    }

    // Save message to database
    const savedMessage = await this.chatService.saveMessage(
      data.roomId,
      userId,
      role,
      data.message,
      data.fileName,
      data.filePath,
      data.fileType,
      data.fileSize
    );

    // Broadcast message to all clients in the room
    this.server.to(data.roomId).emit("receiveMessage", {
      id: savedMessage.id,
      roomId: savedMessage.roomId,
      senderId: savedMessage.senderId,
      senderRole: savedMessage.senderRole,
      message: savedMessage.message,
      fileName: savedMessage.fileName,
      filePath: savedMessage.filePath,
      fileType: savedMessage.fileType,
      fileSize: savedMessage.fileSize,
      createdAt: savedMessage.createdAt,
    });

    this.logger.log(`Message sent in room ${data.roomId} by user ${userId}`);

    // Stop typing when message is sent
    this.stopTyping(data.roomId, userId);

    return { success: true, message: savedMessage };
  }

  /**
   * Handle typing indicator
   */
  @SubscribeMessage("typing")
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const userId = client.data.userId;
    const role = client.data.role;

    if (!userId || !role) {
      return { error: "Unauthorized" };
    }

    // Validate room format
    const roomParts = data.roomId.split(":");
    if (roomParts.length !== 3 || roomParts[0] !== "chat") {
      return { error: "Invalid room format" };
    }

    const roomUserId = parseInt(roomParts[1]);
    const roomAdminId = parseInt(roomParts[2]);

    // Verify user has access to this room
    if (role === "user" && userId !== roomUserId) {
      return { error: "Access denied" };
    }
    if (role === "admin" && userId !== roomAdminId) {
      return { error: "Access denied" };
    }

    // Add user to typing set
    if (!this.typingUsers.has(data.roomId)) {
      this.typingUsers.set(data.roomId, new Set());
    }
    this.typingUsers.get(data.roomId)!.add(userId);

    // Broadcast typing to other users in room
    client.to(data.roomId).emit("userTyping", {
      roomId: data.roomId,
      userId: userId,
      isTyping: true,
    });

    return { success: true };
  }

  /**
   * Handle stop typing indicator
   */
  @SubscribeMessage("stopTyping")
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const userId = client.data.userId;
    this.stopTyping(data.roomId, userId);
    return { success: true };
  }

  /**
   * Helper method to stop typing
   */
  private stopTyping(roomId: string, userId: number) {
    if (this.typingUsers.has(roomId)) {
      this.typingUsers.get(roomId)!.delete(userId);
      if (this.typingUsers.get(roomId)!.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }

    // Broadcast stop typing to other users in room
    this.server.to(roomId).emit("userTyping", {
      roomId: roomId,
      userId: userId,
      isTyping: false,
    });
  }

  /**
   * Broadcast a message to a room (used by controller for file uploads)
   */
  broadcastMessage(message: any) {
    this.server.to(message.roomId).emit("receiveMessage", message);
  }
}
