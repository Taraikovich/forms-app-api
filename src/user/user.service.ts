import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await hash(password);
    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        ...user,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOne(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateHashedRefreshToken(userId: string, hashedRT: string | null) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRT,
      },
    });
  }

  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [count, users] = await Promise.all([
      this.prisma.user.count({
        where: { deletedAt: { equals: null } },
      }),
      this.prisma.user.findMany({
        where: { deletedAt: { equals: null } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          blockedAt: true,
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(count / limit);

    return { users, totalPages, currentPage: page };
  }

  async blockUsers(usersIds: string[]) {
    return this.prisma.user.updateMany({
      where: { id: { in: usersIds } },
      data: { blockedAt: new Date() },
    });
  }

  async unblockUsers(usersIds: string[]) {
    return this.prisma.user.updateMany({
      where: { id: { in: usersIds } },
      data: { blockedAt: null },
    });
  }

  async deleteUsers(usersIds: string[]) {
    return this.prisma.user.updateMany({
      where: { id: { in: usersIds } },
      data: { deletedAt: new Date() },
    });
  }

  async setRole(userIds: string[], role: Role) {
    return await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { role: role },
    });
  }

  async getTheme(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        theme: true,
      },
    });
  }

  async setTheme(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        theme: true,
      },
    });

    if (!user) return;

    const newTheme = user.theme === 'dark' ? 'light' : 'dark';

    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { theme: newTheme },
    });
  }

  async getEmail(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
  }
}
