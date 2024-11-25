import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from '../service';
import { FirebaseAuthGuard, ReqWithUser } from '../guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('idToken') idToken: string, @Res() res: Response) {
    try {
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
