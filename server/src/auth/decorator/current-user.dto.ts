import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const sessionCookie = request.cookies.session;

    if (!sessionCookie) {
      return null;
    }

    try {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      return {
        // Unique Identifiers
        userId: decodedClaims.dbUserId,
        uid: decodedClaims.uid,
        sub: decodedClaims.sub,

        // Authentication Details
        email: decodedClaims.email,
        isEmailVerified: decodedClaims.email_verified,
        signInProvider: decodedClaims.firebase?.sign_in_provider,

        // User Profile
        name: decodedClaims.name,
        profilePicture: decodedClaims.picture,

        // Timing and Authentication Metadata
        issuedAt: decodedClaims.iat, // Timestamp when the token was issued
        authTime: decodedClaims.auth_time, // Time of authentication
        expiresAt: decodedClaims.exp, // Expiration timestamp

        // Issuer and Audience
        issuer: decodedClaims.iss,
        audience: decodedClaims.aud,

        // Firebase-specific Identity Details
        identities: decodedClaims.firebase?.identities,

        // Raw Firebase Claims (if you need full flexibility)
        rawClaims: decodedClaims,
      };
    } catch (error) {
      return null;
    }
  },
);
