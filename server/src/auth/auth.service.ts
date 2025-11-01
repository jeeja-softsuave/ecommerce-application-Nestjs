import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const matches = await bcrypt.compare(pass, user.password);
    if (matches) {
      const { password, ...rest } = user as any;
      return rest;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,  // <-- frontend expects this key
      user,   // <-- send back user info
    };
  }

  async register(
    email: string,
    password: string,
    role = 'user',
    phone?: string,
  ) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new UnauthorizedException('Email already registered');

    const created = await this.usersService.create(email, password, role, phone);
    const { password: _p, ...u } = created as any;

    const payload = { sub: u.id, email: u.email, role: u.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: u,
    };
  }
}
