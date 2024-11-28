import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AuthRepository } from '../repository';
import { CreateUserDto } from '../dto';
import { AuthType } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App,
  ) {}

  async login(idToken: string) {
    const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      // Throw a specific error for email not verified
      throw new BadRequestException(
        'Email not verified. Please verify your email first.',
      );
    }

    const userInfo = await this.authRepository.findOneAndUpdate(
      decodedToken.email,
      {
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.displayName,
        img: decodedToken.picture,
        authType:
          decodedToken.firebase.sign_in_provider === 'password'
            ? AuthType.EMAIL
            : AuthType.GOOGLE,
      },
    );

    await this.firebaseAdmin.auth().setCustomUserClaims(decodedToken.uid, {
      dbUserId: userInfo.id,
    });

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await this.firebaseAdmin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    return { userInfo, sessionCookie, expiresIn };
  }

  async revokeToken(sessionCookie: string): Promise<void> {
    const decodedClaims = await this.firebaseAdmin
      .auth()
      .verifySessionCookie(sessionCookie);
    await this.firebaseAdmin.auth().revokeRefreshTokens(decodedClaims.sub);
  }

  async registerWithEmail(userData: CreateUserDto) {
    try {
      // Validate input
      if (!userData.email || !userData.password) {
        throw new UnauthorizedException('Email and password are required');
      }

      // Check if user already exists in database
      const existingUser = await this.authRepository.findUserByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new UnauthorizedException('User with this email already exists');
      }

      // Create user in database
      const userInfo = await this.authRepository.findOneAndUpdate(
        userData.email,
        {
          email: userData.email,
          name: userData.name,
          authType: AuthType.EMAIL,
        },
      );

      return { userInfo };
    } catch (error) {
      this.logger.error('Registration error', error);
      throw error;
    }
  }
}
