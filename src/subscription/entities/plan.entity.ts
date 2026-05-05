import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { PlanTranslation } from './plan_translations.entity';

@Entity({ name: 'plans' })
export class Plan {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float', { default: 0 })
  price: number;

  @Column('text', { default: 'USD' })
  currency: string;

  @Column('int')
  duration: number;

  @Column('text')
  durationType: 'day' | 'month' | 'year';

  @Column('text', {
    default: 'recurring',
  })
  billingType: 'recurring' | 'one_time' | 'trial' | 'lifetime';

  @Column('int', { nullable: true })
  trialDays?: number;

  @Column('bool', { default: false })
  isFree: boolean;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('bool', { default: false })
  isRecommended: boolean;

  @Column('int', { nullable: true })
  discountPercentage?: number;

  @Column('int', { default: 0 })
  order: number;

  @OneToMany(
    () => PlanTranslation,
    (translation) => translation.plan,
    {
      cascade: ['insert', 'update'],
    }
  )
  translations: PlanTranslation[];

  @OneToMany(
    () => Subscription,
    (subscription) => subscription.plan
  )
  subscriptions: Subscription[];

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}