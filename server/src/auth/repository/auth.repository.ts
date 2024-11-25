import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateUserDto } from '../dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findOneAndUpdate(email: string, userData: CreateUserDto) {
    return this.prisma.user.upsert({
      where: { email },
      update: {
        ...userData,
        updatedAt: new Date(),
      },
      create: {
        email: userData.email,
        name: userData.name,
        img: userData.img,
      },
    });
  }
}
