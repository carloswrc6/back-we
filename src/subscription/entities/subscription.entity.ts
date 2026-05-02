import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../auth/entities/user.entity';
import { Plan } from './plan.entity';

@Entity({ name: 'subscriptions' })
export class Subscription {

    @ApiProperty({
        example: 'uuid',
        description: 'Subscription ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.subscriptions,
        { eager: true }
    )
    user: User;

    @ManyToOne(
        () => Plan,
        (plan) => plan.subscriptions,
        { eager: true }
    )
    plan: Plan;

    @ApiProperty({
        example: 'active',
        description: 'Estado de la suscripción'
    })
    @Column('text', {
        default: 'active'
    })
    status: 'active' | 'cancelled' | 'expired';

    @ApiProperty({
        example: '2026-01-01',
        description: 'Fecha de inicio'
    })
    @Column('timestamp')
    startDate: Date;

    @ApiProperty({
        example: '2026-01-07',
        description: 'Fecha de fin'
    })
    @Column('timestamp')
    endDate: Date;

    @ApiProperty({
        example: true,
        description: 'Renovación automática'
    })
    @Column('bool', {
        default: false
    })
    autoRenew: boolean;

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