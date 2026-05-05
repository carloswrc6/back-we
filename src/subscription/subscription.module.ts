import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { PlanTranslation } from './entities/plan_translations.entity';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
   imports: [
      TypeOrmModule.forFeature([ Plan, PlanTranslation, Subscription ]),
    ],
})
export class SubscriptionModule {}
