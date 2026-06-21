import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MealType } from 'src/common/enums/meal-type';
import { Country } from 'src/countries/entities/country.entity';

@Entity({ name: 'dishes' })
export class Dish {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    description: 'Dish ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Ceviche',
    description: 'Dish name',
  })
  @Column('text')
  name: string;

  @ApiProperty({
    example: 'Ceviche',
    description: 'Dish name in English',
  })
  @Column('text', { nullable: true })
  nameEn: string;

  @ApiProperty({
    example: 'https://example.com/ceviche.jpg',
    description: 'Dish image URL',
  })
  @Column('text')
  image: string;

  @ApiProperty({
    example: ['pescado', 'limón', 'cebolla', 'cilantro'],
    description: 'List of ingredients',
  })
  @Column('text', { array: true })
  ingredients: string[];

  @ApiProperty({
    example: ['fish', 'lime', 'onion', 'cilantro'],
    description: 'List of ingredients in English',
  })
  @Column('text', { array: true, nullable: true })
  ingredientsEn: string[];

  @ApiProperty({
    example: 'lunch',
    description: 'Meal type: breakfast, lunch, dinner',
  })
  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    description: 'Country ID',
  })
  @Column('uuid')
  countryId: string;
}
