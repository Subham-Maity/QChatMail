import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';

export type ReqWithUser = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ReqWithUser>();
    const sessionCookie = request.cookies.session;

    if (!sessionCookie) {
      throw new UnauthorizedException('No session cookie found');
    }

    try {
      const decodedClaims = await this.firebaseAdmin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      request.user = {
        id: decodedClaims.dbUserId,
        email: decodedClaims.email,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
