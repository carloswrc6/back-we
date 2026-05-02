import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from './subscription.entity';

@Entity({ name: 'plans' })
export class Plan {

    @ApiProperty({
        example: 'uuid',
        description: 'Plan ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Prueba gratuita',
        description: 'Nombre del plan'
    })
    @Column('text')
    title: string;

    @ApiProperty({
        example: 'Acceso limitado por 7 días',
        description: 'Descripción del plan'
    })
    @Column('text')
    description: string;

    @ApiProperty({
        example: 0,
        description: 'Precio del plan'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'USD',
        description: 'Moneda'
    })
    @Column('text', {
        default: 'USD'
    })
    currency: string;

    @ApiProperty({
        example: 7,
        description: 'Duración del plan'
    })
    @Column('int')
    duration: number;

    @ApiProperty({
        example: 'day',
        description: 'Tipo de duración'
    })
    @Column('text')
    durationType: 'day' | 'month' | 'year';

    @ApiProperty({
        example: true,
        description: 'Indica si es plan gratuito'
    })
    @Column('bool', {
        default: false
    })
    isFree: boolean;

    @ApiProperty({
        example: true,
        description: 'Plan activo o no'
    })
    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @ApiProperty({
        example: ['Acceso básico', 'Soporte limitado'],
        description: 'Características del plan'
    })
    @Column('text', {
        array: true,
        default: []
    })
    features: string[];

    @ApiProperty({
        example: 1,
        description: 'Orden de visualización del plan'
    })
    @Column('int', {
        default: 0
    })
    order: number;

    @OneToMany(
        () => Subscription,
        (subscription) => subscription.plan
    )
    subscriptions: Subscription[];

    @Column('timestamp', {
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @Column('timestamp', {
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @BeforeInsert()
    createDates() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    updateDates() {
        this.updatedAt = new Date();
    }
}