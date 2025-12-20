import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Get,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  // -------------------------------
  // Register
  // -------------------------------
  @Post("register")
  async register(@Body() body) {
    return this.authService.register(
      body.email,
      body.password,
      body.role,
      body.phone
    );
  }

  // -------------------------------
  // Step 1: Login (no token yet)
  // -------------------------------
  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    return {
      requires2FA: true,
      twoFactorEnabled: user.twoFactorEnabled,
      userId: user.id,
    };
  }

  // -------------------------------
  // Generate QR (only if 2FA not enabled)
  // -------------------------------
  @UseGuards(JwtAuthGuard)
  @Get("2fa/generate")
  async generate2FA(@Req() req) {
    const user = await this.usersService.findById(req.user.id);

    if (user.twoFactorEnabled) {
      return { alreadyEnabled: true };
    }

    const secret = speakeasy.generateSecret({
      name: `E-commerce (${user.email})`,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret in DB
    await this.usersService.save2FASecret(user.id, secret.base32);

    return { qrCode, secret: secret.base32 };
  }

  // -------------------------------
  // Step 2: Verify & Enable 2FA
  // -------------------------------
  @UseGuards(JwtAuthGuard)
  @Post("2fa/verify")
  async verify2FA(@Req() req, @Body() body: { code: string }) {
    const user = await this.usersService.findById(req.user.id);

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: body.code,
      window: 1,
    });

    if (!isValid) throw new UnauthorizedException("Invalid 2FA code");

    await this.usersService.enable2FA(user.id);

    return { success: true, message: "2FA enabled" };
  }

  // -------------------------------
  // Step 3: Login using 2FA
  // -------------------------------
  @Post("2fa/login")
  async loginWith2FA(@Body() body: { userId: number; code: string }) {
    const user = await this.usersService.findById(body.userId);

    if (!user) throw new UnauthorizedException("User not found");

    if (!user.twoFactorEnabled)
      throw new UnauthorizedException("2FA is not enabled");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: body.code,
      window: 1,
    });

    if (!isValid) throw new UnauthorizedException("Invalid 2FA code");

    return this.authService.login(user); // returns token + user
  }
}
