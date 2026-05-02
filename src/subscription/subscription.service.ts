import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [plans, total] = await this.planRepository.findAndCount({
      select: [
        'id',
        'title',
        'description',
        'price',
        'currency',
        'duration',
        'durationType',
      ],
      take: limit,
      skip: offset,
      order: {
        order: 'ASC',
      },
      where: {
        isActive: true,
      },
    });

    return {
      data: plans,
      meta: {
        total,
        limit,
        offset,
        currentPage: Math.floor(offset / limit) + 1,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
