import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities';
import { Subscription } from 'src/subscription/entities/subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { default: 'local' })
  provider: string;

  @Column({ nullable: true })
  appleId: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @Column({
    name: 'resetPasswordCode',
    nullable: true,
    select: false,
  })
  resetPasswordToken?: string;

  @Column({
    nullable: true,
    type: 'timestamp',
  })
  resetPasswordExpires?: Date;

  @Column('int', {
    default: 0,
  })
  resetPasswordAttempts: number;

  @Column('int', {
    default: 0,
  })
  tokenVersion: number;

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
