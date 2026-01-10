import React, { useState, useEffect, useRef } from "react";
import { chatService } from "../services/chat";
import { authService } from "../services/auth";
import axios from "axios";

interface Message {
  id: number;
  roomId: string;
  senderId: number;
  senderRole: string;
  message: string;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
}

interface Admin {
  id: number;
  email: string;
  role: string;
}

const API = "http://localhost:4000/api";

export default function Chat() {
  const [user, setUser] = useState(() => authService.getUser());
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const fetchingRef = useRef<boolean>(false);
  const lastFetchedUserIdRef = useRef<number | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch admins on component mount - only when user changes
  useEffect(() => {
    const fetchChatPartners = async () => {
      // Prevent multiple simultaneous calls
      if (fetchingRef.current) return;
      
      // Only fetch if user ID has changed
      if (user?.id === lastFetchedUserIdRef.current) return;
      
      try {
        fetchingRef.current = true;
        const token = authService.getToken();
        if (!token) {
          fetchingRef.current = false;
          return;
        }
        
        // If user is admin, fetch users; otherwise fetch admins
        const endpoint = user?.role === "admin" ? "users" : "admins";
        const res = await axios.get(`${API}/chat/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(res.data);
        lastFetchedUserIdRef.current = user?.id || null;
      } catch (error) {
        console.error("Failed to fetch chat partners:", error);
      } finally {
        fetchingRef.current = false;
      }
    };

    if (user?.id && user?.role) {
      fetchChatPartners();
    } else {
      // Reset if user is logged out
      lastFetchedUserIdRef.current = null;
      setAdmins([]);
    }
    // Only depend on user.id - a stable identifier
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Initialize socket connection
  useEffect(() => {
    try {
      chatService.connect();
      setIsConnected(true);

      // Listen for incoming messages
      const handleMessage = (message: Message) => {
        setMessages((prev) => {
          // Avoid duplicates by checking if message already exists
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          
          // If message is not from current user and room is not active, increment unread count
          if (message.senderId !== user?.id && message.roomId !== currentRoomIdRef.current) {
            setUnreadCounts((prev) => {
              const newMap = new Map(prev);
              const currentCount = newMap.get(message.roomId) || 0;
              newMap.set(message.roomId, currentCount + 1);
              return newMap;
            });
          }
          
          return [...prev, message];
        });
      };

      // Listen for message history
      const handleHistory = (history: Message[]) => {
        setMessages(history);
      };

      // Listen for typing indicators
      const handleTyping = (data: { roomId: string; userId: number; isTyping: boolean }) => {
        if (data.roomId === currentRoomIdRef.current) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      };

      chatService.onMessage(handleMessage);
      chatService.onMessageHistory(handleHistory);
      chatService.onTyping(handleTyping);

      return () => {
        chatService.offMessage(handleMessage);
        chatService.offMessageHistory(handleHistory);
        chatService.offTyping(handleTyping);
        chatService.disconnect();
      };
    } catch (error) {
      console.error("Failed to connect to chat:", error);
      setIsConnected(false);
    }
  }, []);

  // Join room when admin/user is selected
  useEffect(() => {
    if (selectedAdmin && user) {
      // Room format: chat:userId:adminId (always userId first, then adminId)
      const userId = user.role === "admin" ? selectedAdmin.id : user.id;
      const adminId = user.role === "admin" ? user.id : selectedAdmin.id;
      const roomId = `chat:${userId}:${adminId}`;
      currentRoomIdRef.current = roomId;
      
      // Reset unread count when room is opened
      setUnreadCounts((prev) => {
        const newMap = new Map(prev);
        newMap.set(roomId, 0);
        return newMap;
      });
      
      chatService
        .joinRoom(roomId)
        .then(() => {
          console.log(`Joined room: ${roomId}`);
        })
        .catch((error) => {
          console.error("Failed to join room:", error);
        });
    }

    return () => {
      if (selectedAdmin && user) {
        const userId = user.role === "admin" ? selectedAdmin.id : user.id;
        const adminId = user.role === "admin" ? user.id : selectedAdmin.id;
        const roomId = `chat:${userId}:${adminId}`;
        currentRoomIdRef.current = null;
        chatService.leaveRoom(roomId);
      }
    };
  }, [selectedAdmin, user]);

  // Handle typing indicator
  useEffect(() => {
    if (!selectedAdmin || !user || !newMessage.trim()) {
      // Stop typing if input is empty
      if (currentRoomIdRef.current) {
        chatService.stopTyping(currentRoomIdRef.current);
      }
      return;
    }

    const userId = user.role === "admin" ? selectedAdmin.id : user.id;
    const adminId = user.role === "admin" ? user.id : selectedAdmin.id;
    const roomId = `chat:${userId}:${adminId}`;

    // Emit typing
    chatService.typing(roomId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      chatService.stopTyping(roomId);
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, selectedAdmin, user]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get file icon based on type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return "📄";
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎥";
    if (fileType.startsWith("audio/")) return "🎵";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    if (fileType.includes("zip") || fileType.includes("rar")) return "📦";
    return "📄";
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedAdmin || !user) return;

    // Room format: chat:userId:adminId (always userId first, then adminId)
    const userId = user.role === "admin" ? selectedAdmin.id : user.id;
    const adminId = user.role === "admin" ? user.id : selectedAdmin.id;
    const roomId = `chat:${userId}:${adminId}`;
    
    // Stop typing when sending
    chatService.stopTyping(roomId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      setUploading(true);

      if (selectedFile) {
        // Upload file - backend will broadcast the message via WebSocket
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("roomId", roomId);
        formData.append("message", newMessage.trim());

        const token = authService.getToken();
        await axios.post(`${API}/chat/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        // Clear file selection - message will be received via WebSocket
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        // Regular text message
        await chatService.sendMessage(roomId, newMessage.trim());
      }
      
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Please log in to use chat</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden flex-1 flex">
          {/* Admin Selection Sidebar */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">
                {user.role === "admin" ? "Select User" : "Select Admin"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {user.role === "admin" ? "Select a user to chat" : "Choose an admin to chat with"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {admins.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <p>
                    {user.role === "admin" ? "No users available" : "No admins available"}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {admins.map((admin) => {
                    const userId = user.role === "admin" ? admin.id : user.id;
                    const adminId = user.role === "admin" ? user.id : admin.id;
                    const roomId = `chat:${userId}:${adminId}`;
                    const unreadCount = unreadCounts.get(roomId) || 0;
                    
                    return (
                      <button
                        key={admin.id}
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setMessages([]);
                        }}
                        className={`w-full text-left p-3 rounded-lg mb-2 transition-colors relative ${
                          selectedAdmin?.id === admin.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{admin.email}</div>
                            <div className="text-xs opacity-75">{admin.role}</div>
                          </div>
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-400">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedAdmin ? (
              <>
                {/* Chat Header */}
                <div className="bg-gray-800 p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold">
                    Chat with {selectedAdmin.email}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Room: chat:{user.role === "admin" ? `${selectedAdmin.id}:${user.id}` : `${user.id}:${selectedAdmin.id}`}
                  </p>
                </div>

                {/* Messages Container */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50"
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-100"
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">
                              {isOwnMessage ? "You" : msg.senderRole === "admin" ? "Admin" : "User"}
                            </div>
                            {msg.message && <div className="text-sm mb-2">{msg.message}</div>}
                            {msg.filePath && (
                              <div className="mt-2">
                                <a
                                  href={`http://localhost:4000/uploads/${msg.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-gray-600/50 rounded hover:bg-gray-600 transition-colors"
                                >
                                  <span className="text-xl">{getFileIcon(msg.fileType)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {msg.fileName || "File"}
                                    </div>
                                    {msg.fileSize && (
                                      <div className="text-xs opacity-75">
                                        {formatFileSize(msg.fileSize)}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs">⬇️</span>
                                </a>
                                {msg.fileType?.startsWith("image/") && (
                                  <img
                                    src={`http://localhost:4000/uploads/${msg.filePath}`}
                                    alt={msg.fileName}
                                    className="mt-2 max-w-xs rounded-lg cursor-pointer"
                                    onClick={() => {
                                      window.open(`http://localhost:4000/uploads/${msg.filePath}`, "_blank");
                                    }}
                                  />
                                )}
                              </div>
                            )}
                            <div className="text-xs opacity-75 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Typing Indicator */}
                  {typingUsers.size > 0 && Array.from(typingUsers).some((id) => id !== user?.id) && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm italic">Typing...</span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="bg-gray-800 p-4 border-t border-gray-700"
                >
                  {selectedFile && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                      <span className="text-xl">{getFileIcon(selectedFile.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{selectedFile.name}</div>
                        <div className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center"
                      title="Upload file"
                    >
                      📎
                    </label>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && !selectedFile) || !isConnected || uploading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {uploading ? "..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-900/50">
                <div className="text-center">
                  <p className="text-xl text-gray-400 mb-2">
                    {user.role === "admin"
                      ? "Select a user to start chatting"
                      : "Select an admin to start chatting"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Choose from the sidebar to begin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

