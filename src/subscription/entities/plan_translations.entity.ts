import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Plan } from './plan.entity';

@Entity({ name: 'plan_translations' })
@Unique(['plan', 'language'])
export class PlanTranslation {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 5 })
  language: string; // 'es', 'en'

  @Column('text')
  title: string;

  @Column('text')
  description: string;

  @Column('text', {
    array: true,
    default: [],
  })
  features: string[];

  @Column('text', { nullable: true })
  badge?: string;

  @Column('text', { nullable: true })
  ctaText?: string;

  @Column('text', { nullable: true })
  priceFormatted?: string;

  @ManyToOne(
    () => Plan,
    (plan) => plan.translations,
  )
  plan: Plan;
}