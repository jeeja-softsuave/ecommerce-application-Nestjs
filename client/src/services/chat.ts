import { io, Socket } from "socket.io-client";
import { authService } from "./auth";

const SOCKET_URL = "http://localhost:4000";

/**
 * Chat Service - Manages Socket.IO connection and chat operations
 */
class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Initialize Socket.IO connection with authentication
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    this.socket = io(`${SOCKET_URL}/chat`, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to chat server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from chat server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.isConnected = false;
    });

    return this.socket;
  }

  /**
   * Disconnect from the chat server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Join a chat room
   * @param roomId - Room ID in format: chat:userId:adminId
   */
  joinRoom(roomId: string): Promise<any> {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }
      this.socket.emit("joinRoom", { roomId }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string): Promise<any> {
    if (!this.socket) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.socket!.emit("leaveRoom", { roomId }, (response: any) => {
        resolve(response);
      });
    });
  }

  /**
   * Send a message to a room
   */
  sendMessage(roomId: string, message: string): Promise<any> {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }
      this.socket.emit("sendMessage", { roomId, message }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Listen for incoming messages
   */
  onMessage(callback: (message: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("receiveMessage", callback);
  }

  /**
   * Listen for message history
   */
  onMessageHistory(callback: (messages: any[]) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("messageHistory", callback);
  }

  /**
   * Remove message listener
   */
  offMessage(callback?: (message: any) => void) {
    this.socket?.off("receiveMessage", callback);
  }

  /**
   * Remove message history listener
   */
  offMessageHistory(callback?: (messages: any[]) => void) {
    this.socket?.off("messageHistory", callback);
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Emit typing indicator
   */
  typing(roomId: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit("typing", { roomId });
  }

  /**
   * Emit stop typing indicator
   */
  stopTyping(roomId: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit("stopTyping", { roomId });
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback: (data: { roomId: string; userId: number; isTyping: boolean }) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("userTyping", callback);
  }

  /**
   * Remove typing listener
   */
  offTyping(callback?: (data: { roomId: string; userId: number; isTyping: boolean }) => void) {
    this.socket?.off("userTyping", callback);
  }
}

export const chatService = new ChatService();

