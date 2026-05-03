import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from './subscription.entity';

@Entity({ name: 'plans' })
export class Plan {

  @ApiProperty({
    example: 'uuid',
    description: 'Plan ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Suscripción mensual',
    description: 'Nombre del plan',
  })
  @Column('text')
  title: string;

  @ApiProperty({
    example: 'Acceso completo con renovación automática',
    description: 'Descripción del plan',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 9.99,
    description: 'Precio del plan',
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'USD',
    description: 'Moneda',
  })
  @Column('text', { default: 'USD' })
  currency: string;

  @ApiProperty({
    example: '$9.99 / mes',
    description: 'Precio formateado para UI',
  })
  @Column('text', { nullable: true })
  priceFormatted?: string;

  @ApiProperty({
    example: 1,
    description: 'Duración del plan',
  })
  @Column('int')
  duration: number;

  @ApiProperty({
    example: 'month',
    description: 'Tipo de duración',
  })
  @Column('text')
  durationType: 'day' | 'month' | 'year';

  @ApiProperty({
    example: 'recurring',
    description: 'Tipo de facturación',
  })
  @Column('text', {
    default: 'recurring',
  })
  billingType: 'recurring' | 'one_time' | 'trial' | 'lifetime';

  @ApiProperty({
    example: 7,
    description: 'Días de prueba',
    required: false,
  })
  @Column('int', { nullable: true })
  trialDays?: number;

  @ApiProperty({
    example: true,
    description: 'Indica si es plan gratuito',
  })
  @Column('bool', { default: false })
  isFree: boolean;

  @ApiProperty({
    example: true,
    description: 'Plan activo o no',
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si es el plan recomendado',
  })
  @Column('bool', { default: false })
  isRecommended: boolean;

  @ApiProperty({
    example: 'Más popular',
    description: 'Etiqueta visual del plan',
    required: false,
  })
  @Column('text', { nullable: true })
  badge?: string;

  @ApiProperty({
    example: 20,
    description: 'Porcentaje de descuento',
    required: false,
  })
  @Column('int', { nullable: true })
  discountPercentage?: number;

  @ApiProperty({
    example: ['Acceso ilimitado', 'Sin anuncios'],
    description: 'Características del plan',
  })
  @Column('text', {
    array: true,
    default: [],
  })
  features: string[];

  @ApiProperty({
    example: 1,
    description: 'Orden de visualización',
  })
  @Column('int', { default: 0 })
  order: number;

  @ApiProperty({
    example: 'Comenzar ahora',
    description: 'Texto del botón',
    required: false,
  })
  @Column('text', { nullable: true })
  ctaText?: string;

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

  @BeforeInsert()
  createDates() {
    this.createdAt = new Date();
    this.updatedAt = new Date();

    if (!this.priceFormatted) {
      this.priceFormatted = this.generatePriceFormatted();
    }
  }

  @BeforeUpdate()
  updateDates() {
    this.updatedAt = new Date();

    this.priceFormatted = this.generatePriceFormatted();
  }

  private generatePriceFormatted(): string {
    if (this.isFree) return 'Gratis';

    const symbol = this.currency === 'USD' ? '$' : this.currency;

    let suffix = '';
    if (this.billingType === 'recurring') {
      if (this.durationType === 'month') suffix = '/ mes';
      if (this.durationType === 'year') suffix = '/ año';
      if (this.durationType === 'day') suffix = '/ día';
    }

    if (this.billingType === 'lifetime') {
      suffix = ' pago único';
    }

    return `${symbol}${this.price}${suffix}`;
  }
}