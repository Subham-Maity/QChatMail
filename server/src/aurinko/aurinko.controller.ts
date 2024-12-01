import { Controller } from '@nestjs/common';
import { AurinkoService } from './aurinko.service';

@Controller('aurinko')
export class AurinkoController {
  constructor(private readonly aurinkoService: AurinkoService) {}
}
