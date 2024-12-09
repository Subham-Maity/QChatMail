import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AurinkoService } from '../service';
import { CurrentUser } from '../../auth/decorator';
import { UserTypes } from '../../auth/types';

@Controller('aurinko')
export class AurinkoController {
  constructor(private readonly aurinkoService: AurinkoService) {}

  @Get('auth-url')
  async getAurinkoAuthUrl(
    @CurrentUser() user: UserTypes,
    @Query('serviceType') serviceType: 'Google' | 'Office365',
  ) {
    return this.aurinkoService.getAurinkoAuthUrl(serviceType, user);
  }

  @Post('callback')
  async handleAurinkoCallback(@Body('code') code: string) {
    // Validate the code
    if (!code) {
      throw new BadRequestException(
        'Invalid Request: No authorization code provided',
      );
    }

    try {
      // Exchange the code for a token
      const tokenResponse =
        await this.aurinkoService.exchangeCodeForToken(code);

      if (!tokenResponse) {
        throw new BadRequestException(
          'Invalid Request: No authorization code provided',
        );
      }

      return tokenResponse;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
