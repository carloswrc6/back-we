import { Controller, Get, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Plan } from './entities/plan.entity';
import { PaginatedResponseDto } from 'src/common/dtos/paginate-response.dto';

@ApiTags('Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('/plans')
  findAll(@Query() paginationDto: PaginationDto) : Promise<PaginatedResponseDto<Plan>> {
    return this.subscriptionService.findAll(paginationDto);
  }
}
