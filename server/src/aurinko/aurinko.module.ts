import { Module } from '@nestjs/common';
import { AurinkoService } from './service/aurinko.service';
import { AurinkoController } from './controller/aurinko.controller';

@Module({
  controllers: [AurinkoController],
  providers: [AurinkoService],
})
export class AurinkoModule {}
