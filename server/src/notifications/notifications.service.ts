import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class NotificationsService {
  private transporter;
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: "jeeja.softsuave@gmail.com",
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`❌ Failed to send email: ${error.message}`);
      throw error;
    }
  }

  // 👇 Add this method to stop the TS error
  async sendSms(to: string, message: string) {
    // Placeholder implementation (for now just log)
    this.logger.warn(`📱 SMS to ${to}: ${message}`);
    // In the future, integrate Twilio or another API here
  }
}
