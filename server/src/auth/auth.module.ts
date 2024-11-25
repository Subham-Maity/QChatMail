import { Module } from '@nestjs/common';
import { AuthController } from './controller';
import { AuthService } from './service';
import { FirebaseAdminModule } from './firebase/firebase-admin.module';
import { AuthRepository } from './repository';
import { PrismaModule, PrismaService } from '../prisma';

@Module({
  imports: [FirebaseAdminModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, PrismaService],
})
export class AuthModule {}
