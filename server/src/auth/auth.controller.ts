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

  @Post("register")
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      role?: string;
      phone?: string;
    }
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.role || "user",
      body.phone
    );
  }

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // If user has 2FA enabled → return requires2FA: true
    if (user.twoFactorEnabled) {
      return {
        requires2FA: true,
        userId: user.id,
      };
    }

    return this.authService.login(user);
  }

  // -------------------------------
  //       ENABLE 2FA (SCAN QR)
  // -------------------------------
  @UseGuards(JwtAuthGuard)
  @Get("2fa/generate")
  async generate2FA(@Req() req) {
    const secret = speakeasy.generateSecret({
      name: `E-commerce App (${req.user.email})`,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    await this.usersService.save2FASecret(req.user.id, secret.base32);

    return {
      qrCode,
      secret: secret.base32,
    };
  }

  // -------------------------------
  //     VERIFY 2FA (Enable 2FA)
  // -------------------------------
  @UseGuards(JwtAuthGuard)
  @Post("2fa/verify")
  async verify2FA(@Req() req, @Body() body: { code: string }) {
    const user = await this.usersService.findById(req.user.id);

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: body.code,
    });

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA code");
    }

    await this.usersService.enable2FA(req.user.id);

    return { message: "2FA enabled successfully" };
  }

  // -------------------------------
  //     LOGIN USING OTP
  // -------------------------------
  @Post("2fa/login")
  async loginWith2FA(@Body() body: { userId: number; code: string }) {
    const user = await this.usersService.findById(body.userId);

    if (!user) throw new UnauthorizedException("User not found");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: body.code,
    });

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA code");
    }

    // Return JWT token
    return this.authService.login(user);
  }
}
