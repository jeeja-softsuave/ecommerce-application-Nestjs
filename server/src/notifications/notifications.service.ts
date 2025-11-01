import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

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

  async sendEmail(to: string, subject: string, text: string) {
    if (!process.env.EMAIL_HOST) {
      console.warn('EMAIL_HOST not configured — skipping email');
      return;
    }
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }

  async sendSms(to: string, message: string) {
    // Placeholder: integrate Twilio or other provider here
    if (!process.env.SMS_PROVIDER_API_KEY) {
      console.warn('SMS provider not configured — skipping sms');
      return;
    }
    // Example: call provider API with fetch / axios (not implemented here)
    console.log(`Pretend sending SMS to ${to}: ${message}`);
  }
}
