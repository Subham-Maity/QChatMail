import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AuthRepository } from '../repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App,
  ) {}

  async login(idToken: string) {
    const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(idToken);

    const userInfo = await this.authRepository.findOneAndUpdate(
      decodedToken.email,
      {
        email: decodedToken.email,
        name: decodedToken.name,
        img: decodedToken.picture,
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
}
