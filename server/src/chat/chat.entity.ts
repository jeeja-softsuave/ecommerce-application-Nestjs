import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

/**
 * Chat Entity - Stores chat messages between users and admins
 * Room format: chat:userId:adminId
 */
@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomId: string; // Format: chat:userId:adminId

  @Column()
  senderId: number; // User ID who sent the message

  @Column()
  senderRole: string; // 'user' or 'admin'

  @Column()
  message: string; // Message content

  @Column({ nullable: true })
  fileName?: string; // Original file name

  @Column({ nullable: true })
  filePath?: string; // Path to uploaded file

  @Column({ nullable: true })
  fileType?: string; // MIME type of file

  @Column({ nullable: true, type: "bigint" })
  fileSize?: number; // File size in bytes

  @CreateDateColumn()
  createdAt: Date;
}

