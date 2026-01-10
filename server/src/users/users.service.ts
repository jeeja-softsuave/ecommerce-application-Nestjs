import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>
  ) {}

  async create(email: string, password: string, role = "user", phone?: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({
      email,
      password: hashed,
      role,
      phone,
    });
    return this.usersRepo.save(user);
  }

  // -----------------------------
  // Find by email
  // -----------------------------
  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  // -----------------------------
  // Find by ID
  // -----------------------------
  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // -----------------------------
  // Save 2FA Secret Key
  // -----------------------------
  async save2FASecret(userId: number, secret: string) {
    return this.usersRepo.update({ id: userId }, { twoFactorSecret: secret });
  }

  // -----------------------------
  // Enable 2FA
  // -----------------------------
  async enable2FA(userId: number) {
    return this.usersRepo.update({ id: userId }, { twoFactorEnabled: true });
  }

  // -----------------------------
  // Optional: Disable 2FA
  // -----------------------------
  async disable2FA(userId: number) {
    return this.usersRepo.update(
      { id: userId },
      { twoFactorEnabled: false, twoFactorSecret: null }
    );
  }

  // -----------------------------
  // Find all admin users
  // -----------------------------
  async findAllAdmins() {
    return this.usersRepo.find({ where: { role: "admin" } });
  }

  // -----------------------------
  // Find all users (for admin chat selection)
  // -----------------------------
  async findAllUsers() {
    return this.usersRepo.find();
  }
}
