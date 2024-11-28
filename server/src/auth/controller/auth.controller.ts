import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from '../service';
import { FirebaseAuthGuard, ReqWithUser } from '../guard';
import { CreateUserDto } from '../dto';
import * as admin from 'firebase-admin';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App,
  ) {}

  @Post('register')
  async register(@Body() userData: CreateUserDto, @Res() res: Response) {
    try {
      const { userInfo } = await this.authService.registerWithEmail(userData);
      return res.json(userInfo);
    } catch (error) {
      return res.status(400).json({ message: 'Registration failed' });
    }
  }

  @Post('login')
  async login(@Body('idToken') idToken: string, @Res() res: Response) {
    try {
      if (!idToken) {
        return res.status(400).json({ message: 'No idToken provided' });
      }

      const { userInfo, sessionCookie, expiresIn } =
        await this.authService.login(idToken);

      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return res.json(userInfo);
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message.includes('Email not verified')
      ) {
        // Specific handling for unverified email case
        return res.status(401).json({ message: error.message });
      }

      // Generic unauthorized error handling
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async me(@Req() req: ReqWithUser) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  async logout(@Req() req: ReqWithUser, @Res() res: Response) {
    await this.authService.revokeToken(req.cookies.session);
    res.clearCookie('session');
    return res.json({ message: 'Logged out successfully' });
  }
}
