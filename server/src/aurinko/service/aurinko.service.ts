import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserTypes } from '../../auth/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AurinkoService {
  constructor(private configService: ConfigService) {}

  async getAurinkoAuthUrl(
    serviceType: 'Google' | 'Office365',
    user: UserTypes,
  ) {
    // Ensure user is authenticated
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    const returnUrl = this.configService.get<string>('AURINKO_PUBLIC_URL');
    const params = new URLSearchParams({
      clientId: this.configService.get<string>('AURINKO_CLIENT_ID'),
      serviceType: serviceType,
      scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
      responseType: 'code',
      returnUrl: `${returnUrl}/api/aurinko/callback`,
    });
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
  }
}
