import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'avoid_reasons' })
export class AvoidReason {
  @ApiProperty({
    example: 1,
    description: 'Reason ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    example: 'taste',
    description: 'Reason key',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  key: string;

  @ApiProperty({
    example: 'Taste',
    description: 'Label in English',
  })
  @Column('text', { name: 'label_en' })
  labelEn: string;

  @ApiProperty({
    example: 'Sabor',
    description: 'Label in Spanish',
  })
  @Column('text', { name: 'label_es' })
  labelEs: string;

  @ApiProperty({
    example: 'The flavor is unpleasant (too bitter, sour, sweet, salty, etc.)',
    description: 'Description in English',
  })
  @Column('text', { name: 'description_en' })
  descriptionEn: string;

  @ApiProperty({
    example: 'El gusto resulta desagradable (muy amargo, ácido, dulce, salado, etc.)',
    description: 'Description in Spanish',
  })
  @Column('text', { name: 'description_es' })
  descriptionEs: string;
}
