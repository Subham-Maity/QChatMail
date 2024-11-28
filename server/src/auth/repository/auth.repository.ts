import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateUserDto } from '../dto';
import { AuthType } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneAndUpdate(
    email: string,
    userData: CreateUserDto & { authType?: AuthType },
  ) {
    return this.prisma.user.upsert({
      where: { email },
      update: {
        ...userData,
        updatedAt: new Date(),
        ...(userData.authType ? { authType: userData.authType } : {}),
      },
      create: {
        email: userData.email,
        name: userData.name,
        img: userData.img,
        authType: userData.authType || AuthType.EMAIL,
      },
    });
  }
}
