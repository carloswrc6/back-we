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

  async findAll(paginationDto: PaginationDto, lang: string) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [plans, total] = await this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect(
        'plan.translations',
        'translation',
        'translation.language IN (:...langs)',
        { langs: [lang, 'en'] },
      )
      .where('plan.isActive = true')
      .orderBy('plan.isRecommended', 'DESC')
      .addOrderBy('plan.order', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const data = plans.map((plan) => {
      const t =
        plan.translations.find((t) => t.language === lang) ||
        plan.translations.find((t) => t.language === 'en');

      return {
        id: plan.id,
        price: plan.price,
        currency: plan.currency,
        priceFormatted: t?.priceFormatted,

        duration: plan.duration,
        durationType: plan.durationType,
        billingType: plan.billingType,
        trialDays: plan.trialDays,

        isFree: plan.isFree,
        isRecommended: plan.isRecommended,
        discountPercentage: plan.discountPercentage,
        order: plan.order,

        title: t?.title,
        description: t?.description,
        features: t?.features,
        badge: t?.badge,
        ctaText: t?.ctaText,
      };
    });

    return {
      data,
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
