import { Controller, Get, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginate-response.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { Headers } from '@nestjs/common';

@ApiTags('Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('/plans')
  findAll(
    @Query() paginationDto: PaginationDto,
    @Headers('accept-language') langHeader: string,
  ): Promise<PaginatedResponseDto<PlanResponseDto>> {
    const lang = langHeader || 'en';
    return this.subscriptionService.findAll(paginationDto, lang);
  }
}
