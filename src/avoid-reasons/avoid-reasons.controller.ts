import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvoidReasonsService } from './avoid-reasons.service';

@ApiTags('Avoid Reasons')
@Controller('avoid-reasons')
export class AvoidReasonsController {
  constructor(private readonly avoidReasonsService: AvoidReasonsService) {}

  @Get()
  findAll(@Headers('accept-language') language: string) {
    return this.avoidReasonsService.findAll(language || 'en');
  }
}
