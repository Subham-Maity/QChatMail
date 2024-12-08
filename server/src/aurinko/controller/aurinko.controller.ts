import { Controller, Get, Query } from '@nestjs/common';
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
}
