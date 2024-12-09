import { Module } from '@nestjs/common';
import { AurinkoController } from './controller';
import { AurinkoService } from './service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AurinkoController],
  providers: [AurinkoService],
})
export class AurinkoModule {}
