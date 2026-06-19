import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


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
  resetPasswordCode?: string;

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

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
