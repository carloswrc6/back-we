import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'countries' })
export class Country {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    description: 'Country ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'MX',
    description: 'ISO 3166-1 alpha-2 country code',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  code: string;

  @ApiProperty({
    example: 'México',
    description: 'Country name in Spanish',
  })
  @Column('text')
  name: string;
}
