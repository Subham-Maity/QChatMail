import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserTypes } from '../../auth/types';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class AurinkoService {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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

  async exchangeCodeForToken(code: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `https://api.aurinko.io/v1/auth/token/${code}`,
          {},
          {
            auth: {
              username: this.configService.get('AURINKO_CLIENT_ID'),
              password: this.configService.get('AURINKO_CLIENT_SECRET'),
            },
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      console.log('Token exchange successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Token exchange error:',
        error.response?.data || error.message,
      );

      if (error instanceof AxiosError) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }

      throw new HttpException('Token exchange failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
