import { Module } from '@nestjs/common';
import { AurinkoService } from './aurinko.service';
import { AurinkoController } from './aurinko.controller';

@Module({
  controllers: [AurinkoController],
  providers: [AurinkoService],
})
export class AurinkoModule {}
